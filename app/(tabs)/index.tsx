import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { RecordCard } from "@/components/RecordCard";
import { getAllRecords, deleteRecord, type OilChangeRecord } from "@/lib/storage";

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<OilChangeRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecords = useCallback(async () => {
    const data = await getAllRecords();
    setRecords(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  }, [loadRecords]);

  const handleDelete = useCallback((record: OilChangeRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Eliminar registro",
      `Eliminar cambio de aceite de ${record.plate}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteRecord(record.id);
            loadRecords();
          },
        },
      ]
    );
  }, [loadRecords]);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const renderItem = useCallback(
    ({ item }: { item: OilChangeRecord }) => (
      <Pressable
        onLongPress={() => handleDelete(item)}
        delayLongPress={600}
      >
        <RecordCard record={item} />
      </Pressable>
    ),
    [handleDelete]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top + webTopInset + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>OilTrack</Text>
          <Text style={styles.headerSubtitle}>
            {records.length} {records.length === 1 ? "registro" : "registros"}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="water" size={28} color={Colors.amber} />
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.amber} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptyText}>
              Agrega tu primer cambio de aceite en la pestana "Nuevo"
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.darkNavy,
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(229, 161, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.light.text,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
