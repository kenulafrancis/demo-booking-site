<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    public function getWallet(): JsonResponse
    {
        $userId = Auth::id();

        // Fetch all wallet transactions
        $transactions = DB::table('wallet_transactions')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate wallet balance
        $walletBalance = $transactions->sum('amount');

        // Return balance and transactions
        return response()->json([
            'balance' => $walletBalance,
            'transactions' => $transactions,
        ]);
    }

    public function processWalletPayment(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $totalPrice = $request->input('totalPrice');

        // Fetch current wallet balance
        $transactions = DB::table('wallet_transactions')
            ->where('user_id', $userId)
            ->get();

        $walletBalance = $transactions->sum('amount');

        // Check if the user has enough balance
        if ($walletBalance < $totalPrice) {
            return response()->json(['error' => 'Insufficient balance'], 400);
        }

        // Deduct amount from wallet balance
        DB::table('wallet_transactions')->insert([
            'user_id' => $userId,
            'amount' => -$totalPrice,
            'transaction_type' => 'debit',
            'description' => 'Booking Payment',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Payment successful'], 200);
    }
}
