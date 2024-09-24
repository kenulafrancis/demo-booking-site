import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Wallet({ auth }) {
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchWalletData() {
            try {
                const response = await axios.get('/api/wallet');
                setWalletBalance(response.data.balance);
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error('Error fetching wallet data', error);
            }
        }
        fetchWalletData().then(r => console.log('Wallet data fetched'));
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Wallet" />

            <div className="min-h-screen bg-gray-100">
                <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <section className="mb-12 p-5 bg-[#dcf763cc] rounded-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Wallet Balance: ${walletBalance}</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Transaction History</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <div key={transaction.id} className="bg-white shadow-lg rounded-lg p-6">
                                        <p><strong>Type:</strong> {transaction.transaction_type}</p>
                                        <p><strong>Amount:</strong> ${transaction.amount}</p>
                                        <p><strong>Description:</strong> {transaction.description}</p>
                                        <p><strong>Date:</strong> {new Date(transaction.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No transactions available.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
