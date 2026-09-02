<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;
use Spatie\PdfToImage\Pdf;
use thiagocsf\Tesseract\Tesseract;

class Form5VerificationService
{
    /**
     * Process uploaded Form 5 PDF, verify student identity, and check for current term validity.
     */
    public function verifyAndExtract(string $pdfAbsolutePath, string $expectedStudentNumber, string $expectedFullName): array
    {
        $extractedText = '';

        // 1. Direct PDF Text Extraction
        try {
            $parser = new Parser();
            $pdfDocument = $parser->parseFile($pdfAbsolutePath);
            $extractedText = $pdfDocument->getText();
        } catch (Exception $e) {
            Log::warning('Direct PDF parsing failed: ' . $e->getMessage());
        }

        // 2. OCR Fallback for scanned documents
        if (empty(trim($extractedText))) {
            $tempDirectory = storage_path('app/private/temp');

            if (!file_exists($tempDirectory)) {
                mkdir($tempDirectory, 0755, true);
            }

            $tempPngPath = $tempDirectory . '/' . uniqid('form5_full_') . '.png';

            try {
                $pdf = new Pdf($pdfAbsolutePath);
                $pdf->setPage(1)
                    ->setResolution(200)
                    ->saveImage($tempPngPath);

                $ocr = new Tesseract();
                $extractedText = $ocr->recognize($tempPngPath);
            } catch (Exception $e) {
                Log::error('Form 5 OCR Fallback Error: ' . $e->getMessage());
                return [
                    'is_verified'    => false,
                    'is_latest_term' => false,
                    'data'           => [],
                ];
            } finally {
                if (file_exists($tempPngPath)) {
                    unlink($tempPngPath);
                }
            }
        }

        // 3. Evaluate identity matches
        $hasIdentityMatch = $this->evaluateMatches($extractedText, $expectedStudentNumber, $expectedFullName);

        // 4. Parse document metadata
        $parsedData = $this->parseMetadata($extractedText);

        // 5. Evaluate dynamic calendar term match
        $isLatestTerm = $this->validateDynamicTerm($parsedData, $extractedText);

        return [
            'is_verified'    => $hasIdentityMatch && $isLatestTerm,
            'is_latest_term' => $isLatestTerm,
            'data'           => $parsedData,
        ];
    }

    /**
     * Dynamically validate extracted term against active calendar window.
     */
    private function validateDynamicTerm(array $parsedData, string $rawText): bool
    {
        [$expectedAY, $expectedSemTokens] = $this->getCurrentAcademicTerm();

        $normalizedRawText = $this->normalizeString($rawText);
        $extractedAY = $parsedData['academic_year'] ? $this->normalizeString($parsedData['academic_year']) : $normalizedRawText;
        $extractedSem = $parsedData['semester'] ? $this->normalizeString($parsedData['semester']) : $normalizedRawText;

        // Check if expected Academic Year (e.g. "2026 2027") appears in extracted text
        $hasAYMatch = str_contains($extractedAY, $this->normalizeString($expectedAY));

        // Check if any expected semester tokens (e.g. "FIRST", "1ST", "1") appear in extracted text
        $hasSemMatch = false;
        foreach ($expectedSemTokens as $token) {
            if (str_contains($extractedSem, $token)) {
                $hasSemMatch = true;
                break;
            }
        }

        return $hasAYMatch && $hasSemMatch;
    }

    /**
     * Compute active Academic Year and Semester tokens based on current system date.
     */
    private function getCurrentAcademicTerm(): array
    {
        $month = (int) date('n');
        $year  = (int) date('Y');

        // PH Academic Calendar Window Rules
        if ($month >= 8 && $month <= 12) {
            // August - December: First Semester
            $academicYear = $year . '-' . ($year + 1);
            $semesterTokens = ['FIRST', '1ST', 'SEM 1', 'SEMESTER 1'];
        } elseif ($month >= 1 && $month <= 5) {
            // January - May: Second Semester
            $academicYear = ($year - 1) . '-' . $year;
            $semesterTokens = ['SECOND', '2ND', 'SEM 2', 'SEMESTER 2'];
        } else {
            // June - July: Midyear / Summer
            $academicYear = ($year - 1) . '-' . $year;
            $semesterTokens = ['MIDYEAR', 'SUMMER'];
        }

        return [$academicYear, $semesterTokens];
    }

    /**
     * Validate extracted text against input identity parameters.
     */
    private function evaluateMatches(string $extractedText, string $expectedStudentNumber, string $expectedFullName): bool
    {
        $normalizedText = $this->normalizeString($extractedText);
        $normalizedStudentNum = $this->normalizeString($expectedStudentNumber);

        $hasNumberMatch = str_contains($normalizedText, $normalizedStudentNum);

        $nameParts = array_filter(explode(' ', $this->normalizeString($expectedFullName)));
        $matchedCount = 0;

        foreach ($nameParts as $part) {
            if (strlen($part) > 1 && str_contains($normalizedText, $part)) {
                $matchedCount++;
            }
        }

        return $hasNumberMatch && (count($nameParts) > 0 && ($matchedCount >= min(2, count($nameParts))));
    }

    /**
     * Parse metadata fields using key label regex search.
     */
    private function parseMetadata(string $text): array
    {
        $data = [
            'degree'        => null,
            'year_section'  => null,
            'semester'      => null,
            'academic_year' => null,
        ];

        if (preg_match('/Degree\s*:\s*(.+)/i', $text, $matches)) {
            $data['degree'] = trim(explode("\n", $matches[1])[0]);
        }

        if (preg_match('/Year\s*\/\s*Section\s*:\s*(.+)/i', $text, $matches)) {
            $data['year_section'] = trim(explode("\n", $matches[1])[0]);
        }

        if (preg_match('/Semester\s*:\s*(.+)/i', $text, $matches)) {
            $data['semester'] = trim(explode("\n", $matches[1])[0]);
        }

        if (preg_match('/Academic\s*Year\s*:\s*(.+)/i', $text, $matches)) {
            $data['academic_year'] = trim(explode("\n", $matches[1])[0]);
        }

        return $data;
    }

    /**
     * Convert string to uppercase alphanumeric tokens.
     */
    private function normalizeString(string $input): string
    {
        return strtoupper((string) preg_replace('/[^A-Za-z0-9]/', ' ', $input));
    }
}