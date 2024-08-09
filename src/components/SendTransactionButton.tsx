import { useState, useEffect } from "react"

import { HStack, Text, Spinner, Button, Link } from "@chakra-ui/react"
import NextLink from "next/link"

import { abi } from "public/data/CumulativeMerkleDropAbi"

import { mainnet } from "wagmi/chains"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"

import { http, createConfig } from "@wagmi/core"

export default function SendTransactionButton({
    rewardsType,
    connectedWalletAddress,
    merkleProofRoot,
    merkleProofEntry,
    setIsTransactionConfirmed,
    setTransactionHash,
}) {
    const [cumulativeMerkleDropAddress, setCumulativeMerkleDropAddress] = useState("")
    const [transactionState, setTransactionState] = useState({
        isWaitingForSignature: false,
        isConfirming: false,
        isConfirmed: false,
        hash: null,
        error: null,
    })

    const { data: hash, error, writeContract } = useWriteContract()

    // UseEffect - Fetch the Merkle drop address based on the rewards type
    useEffect(() => {
        const fetchAddress = async () => {
            const response = await fetch(`/data/${rewardsType}/CumulativeMerkleDropAddress`)
            const address = await response.text()
            setCumulativeMerkleDropAddress(address)
        }
        fetchAddress()
    }, [rewardsType])

    // Create a config object for the transaction
    const config = createConfig({
        chains: [mainnet],
        transports: {
            [mainnet.id]: http(process.env.NEXT_PUBLIC_JSON_RPC),
        },
    })
    // Use the useWaitForTransactionReceipt hook to check the status of the transaction
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: hash,
        config,
    })

    const handleTransaction = async () => {
        try {
            setTransactionState({ ...transactionState, error: null, isWaitingForSignature: true })

            const account = merkleProofEntry.address
            const cumulativeAmount = merkleProofEntry.amount
            const expectedMerkleRoot = merkleProofRoot
            const merkleProof = merkleProofEntry.proof

            writeContract(
                {
                    address: `0x${cumulativeMerkleDropAddress.slice(2)}`,
                    abi: abi,
                    functionName: "claim",
                    args: [account, cumulativeAmount, expectedMerkleRoot, merkleProof],
                    chain: mainnet,
                    account: `0x${connectedWalletAddress.slice(2)}`,
                },
                {
                    onSuccess: async () => {
                        console.log("Transaction sent to network")
                    },
                }
            )
        } catch (err) {
            console.error(err)
            setTransactionState({ ...transactionState, error: err.message, isWaitingForSignature: false })
        }
    }

    useEffect(() => {
        if (isConfirming) {
            console.log("Transaction is confirming...")
            setTransactionState({ ...transactionState, error: null, hash: hash, isWaitingForSignature: false, isConfirming: true })
            setTransactionHash(hash)
        }
        if (isConfirmed) {
            console.log("Transaction confirmed.")
            setIsTransactionConfirmed(true)
            setTransactionState({ ...transactionState, error: null, isWaitingForSignature: false, isConfirming: false, isConfirmed: true })
        }
        if (error) {
            console.log("Error:", error)
            setTransactionState({ ...transactionState, error: error.message, isWaitingForSignature: false, isConfirming: false, isConfirmed: false })
        }
    }, [isConfirming, isConfirmed, error])

    return (
        <>
            <Button
                w={"100%"}
                maxW={"450px"}
                py={4}
                px={8}
                variant={
                    transactionState.isWaitingForSignature || transactionState.isConfirming ? "ClaimRewardsDisabledButton" : "ClaimRewardsButton"
                }
                fontSize={"xl"}
                borderRadius={"full"}
                whiteSpace={"normal"}
                h="fit-content"
                onClick={handleTransaction}
            >
                {transactionState.isWaitingForSignature ? (
                    <HStack gap={5}>
                        <Spinner />
                        <Text>Sign the transaction in your wallet...</Text>
                    </HStack>
                ) : transactionState.isConfirming ? (
                    <HStack gap={5}>
                        <Spinner />
                        <Text>Confirming transaction...</Text>
                    </HStack>
                ) : (
                    "Claim Rewards"
                )}
            </Button>
            {transactionState.hash && (
                <Text>
                    View transaction{" "}
                    <Link
                        as={NextLink}
                        href={`https://etherscan.io/tx/${transactionState.hash}`}
                        color={"blue"}
                        textDecoration={"underline"}
                        target="_blank"
                    >
                        on Etherscan ↗
                    </Link>
                </Text>
            )}
            {transactionState.error && <Text color="red">Error: {transactionState.error.split("\n")[0]}</Text>}
        </>
    )
}