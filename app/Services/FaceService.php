<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FaceService
{
    public function extractEmbeddingFromUploadedFile(UploadedFile $file): array
    {
        return $this->extractEmbeddingFromBytes(
            file_get_contents($file->getRealPath())
        );
    }

    public function extractEmbeddingFromBytes(string $bytes): array
    {
        $response = Http::timeout(15)->post(
            rtrim(config('services.face.url'), '/').'/extract-embedding',
            [
                'image_base64' => 'data:image/jpeg;base64,'.base64_encode($bytes),
            ]
        );

        if ($response->failed()) {
            throw new RuntimeException(
                $response->json('detail') ?? 'Biometric service rejected the image.'
            );
        }

        $embedding = $response->json('embedding');

        if (!is_array($embedding) || count($embedding) === 0) {
            throw new RuntimeException('Biometric service returned an invalid embedding.');
        }

        return $embedding;
    }

    public function cosineSimilarity(array $vecA, array $vecB): float
    {
        if (count($vecA) === 0 || count($vecA) !== count($vecB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($vecA as $i => $a) {
            $b = $vecB[$i];
            $dotProduct += $a * $b;
            $normA += $a ** 2;
            $normB += $b ** 2;
        }

        if ($normA == 0.0 || $normB == 0.0) {
            return 0.0;
        }

        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}
