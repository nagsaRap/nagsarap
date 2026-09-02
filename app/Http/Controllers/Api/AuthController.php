<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login student from Flutter/mobile application.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],

            'device_name' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        $user = User::with('student')
            ->where(
                'email',
                $validated['email']
            )
            ->first();

        if (
            !$user ||
            !Hash::check(
                $validated['password'],
                $user->password
            )
        ) {
            return response()->json([
                'success' => false,
                'code' => 'INVALID_CREDENTIALS',
                'message' =>
                    'The provided credentials are incorrect.',
            ], 422);
        }

        /**
         * Only students should use the mobile
         * attendance application.
         */
        if (!$user->isStudent()) {
            return response()->json([
                'success' => false,
                'code' =>
                    'STUDENT_ACCOUNT_REQUIRED',

                'message' =>
                    'The mobile attendance application is for student accounts.',
            ], 403);
        }

        /**
         * Remove old token from same device name
         * if one already exists.
         */
        $user->tokens()
            ->where(
                'name',
                $validated['device_name']
            )
            ->delete();

        /**
         * Create Sanctum token.
         */
        $token = $user
            ->createToken(
                $validated['device_name'],
                ['student']
            )
            ->plainTextToken;

        return response()->json([
            'success' => true,

            'code' => 'LOGIN_SUCCESS',

            'message' =>
                'Login successful.',

            'data' => [
                'token' =>
                    $token,

                'token_type' =>
                    'Bearer',

                'user' =>
                    $user->load(
                        'student'
                    ),
            ],
        ]);
    }

    /**
     * Return authenticated mobile user.
     */
    public function me(
        Request $request
    ): JsonResponse {
        return response()->json([
            'success' => true,

            'data' =>
                $request
                    ->user()
                    ->load('student'),
        ]);
    }

    /**
     * Logout current mobile device.
     */
    public function logout(
        Request $request
    ): JsonResponse {
        $request
            ->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'success' => true,

            'code' =>
                'LOGOUT_SUCCESS',

            'message' =>
                'Logged out successfully.',
        ]);
    }
}