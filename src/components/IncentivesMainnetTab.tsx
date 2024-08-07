import { useState, useEffect } from "react"
import { VStack, HStack, Text, Spinner, Button } from "@chakra-ui/react"

import useFetchLatestFile from "@/hooks/useFetchLatestFile"
import useFetchPreviouslyClaimedRewards from "@/hooks/useFetchPreviouslyClaimedRewards"

export default function IncentivesMainnetTab({ address }) {
    const [merkleProof, setMerkleProof] = useState(null)
    const [merkleProofDate, setMerkleProofDate] = useState(null)
    const [merkleProofEntry, setMerkleProofEntry] = useState(null)
    const [previouslyClaimedRewards, setPreviouslyClaimedRewards] = useState(null)
    const [unclaimedRewards, setUnclaimedRewards] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [minimumDelayLoading, setMinimumDelayLoading] = useState(true)

    // UseEffect - Fetch the latest Merkle Proof file
    useFetchLatestFile(setMerkleProof, setMerkleProofDate, "mainnetIncentives")

    // UseEffect - When `address` has a value, check to see if it is in the Merkle Proof and get previously claimed rewards
    useFetchPreviouslyClaimedRewards("mainnetIncentives", address, merkleProof, setMerkleProofEntry, setPreviouslyClaimedRewards, setIsLoading)

    // UseEffect - Calculate the unclaimed rewards
    useEffect(() => {
        if (merkleProofEntry) {
            setUnclaimedRewards(merkleProofEntry.amount - previouslyClaimedRewards)
        }
    }, [merkleProofEntry, previouslyClaimedRewards])

    // Add a minimum delay to the loading spinner so that it doesn't flash too quickly to see
    useEffect(() => {
        setTimeout(() => {
            setMinimumDelayLoading(false)
        }, 600)
    }, [])

    if (minimumDelayLoading || isLoading) {
        return (
            <HStack justifyContent={"center"} minH={"350px"}>
                <Spinner />
                <Text>Loading...</Text>
            </HStack>
        )
    }

    return (
        <VStack gap={6} width="100%" p={3} textAlign={"center"} fontWeight={"bold"}>
            <VStack gap={1}>
                <Text>Latest Results Calculation </Text>
                <Text color={"gold"} fontSize={"xl"}>
                    {merkleProofDate}
                </Text>
            </VStack>
            <VStack>
                <Text fontSize={"2xl"}>Unclaimed Rewards</Text>
                <Text fontSize={"3xl"} color={unclaimedRewards > 0 ? "green" : "none"}>
                    <HStack gap={6}>
                        <Text>{unclaimedRewards > 0 ? "🥳" : "😔"}</Text>
                        <Text>{formatSSVAmount(unclaimedRewards)} SSV</Text>
                        <Text>{unclaimedRewards > 0 ? "🥳" : "😔"}</Text>
                    </HStack>
                </Text>
            </VStack>
            {unclaimedRewards > 0 ? (
                <Button py={4} px={8} variant={"ConnectWalletButton"} fontSize={"lg"} borderRadius={"full"} whiteSpace={"normal"} h="fit-content">
                    Connect wallet to claim rewards
                </Button>
            ) : (
                <VStack gap={0} className={"bgPage"} borderRadius={"20px"} py={3} px={5}>
                    <Text>It looks like you do not have any rewards to claim right now.</Text>
                    <Text>Try checking again when the results have been updated.</Text>
                </VStack>
            )}
            <VStack>
                <Text>Previously claimed rewards</Text>
                <Text>{formatSSVAmount(previouslyClaimedRewards)} SSV</Text>
            </VStack>
            <Text>View and interact with the rewards contract directly on Etherscan ↗</Text>
            {/* <Text>https://etherscan.io/address/0xe16d6138B1D2aD4fD6603ACdb329ad1A6cD26D9f</Text> */}
        </VStack>
    )
}

function formatSSVAmount(amount) {
    return (amount / 1e18).toFixed(4)
}
