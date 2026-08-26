// import Header from '@/components/Header'
import { Text, View } from 'react-native'
import { useTheme } from '@/theme'
import ScreenHeader from '@/components/ui/ScreenHeader'

const FoodDeliveryScreen = () => {
    const { colors } = useTheme();
    return (
        <View className="flex-1 bg-background">
            {/* <Header title="Food Delivery" /> */}
            <ScreenHeader
                title="Food Delivery"
            />
            <View className="flex-1 items-center justify-center">
                <Text className='text-primary text-xl font-bold'>FoodDeliveryScreen</Text>
            </View>
        </View>
    )
}

export default FoodDeliveryScreen