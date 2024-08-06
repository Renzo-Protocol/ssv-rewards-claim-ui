import { useState } from "react"
import { VStack, Text, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"

import IncentivesMainnetTab from "./IncentivesMainnetTab"

export default function RewardsContainer() {
    const [activeTabIndex, setActiveTabIndex] = useState(0)

    const handleTabChange = (index) => {
        setActiveTabIndex(index)
    }

    return (
        <VStack gap={6} width="100%">
            <Tabs isFitted width="100%" variant={"RewardsTabs"} onChange={handleTabChange}>
                <TabList borderColor={"transparent"} mb={0}>
                    <Tab py={2} fontWeight={"bold"} fontSize={"lg"}>
                        <Text mb={activeTabIndex == 0 ? "4px" : "0"} mr={activeTabIndex == 0 ? "4px" : "0"}>
                            Mainnet Incentives
                        </Text>
                    </Tab>
                    <Tab py={2} fontWeight={"bold"} fontSize={"lg"}>
                        <Text mb={activeTabIndex == 1 ? "4px" : "0"} ml={activeTabIndex == 1 ? "4px" : "0"}>
                            Lido Vault (Coming soon…)
                        </Text>
                    </Tab>
                </TabList>
                <TabPanels className="contentContainer" border={"2px solid"} borderTop={"none"} borderBottomRadius={"20px"}>
                    <TabPanel>
                        <IncentivesMainnetTab />
                    </TabPanel>
                    <TabPanel>
                        <Text minH={"400px"} pt={10} textAlign={"center"} fontWeight={"bold"}>
                            🏗️ Coming soon! 🏗️
                        </Text>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </VStack>
    )
}
