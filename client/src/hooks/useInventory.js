import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../utils/instance";
import { message } from "../utils/message";

export const useInventory = (pharmacyId) => {
  const queryClient = useQueryClient();

  const fetchInventory = async () => {
    const { data } = await instance.get(
      `/inventory?pharmacyId=${pharmacyId || 1}`
    );
    return data;
  };

  const addStockMutation = useMutation({
    mutationFn: async (stockData) => {
      const { data } = await instance.post("/inventory", {
        ...stockData,
        pharmacyId,
      });
      return data;
    },
    onSuccess: () => {
      message.success("Stock added successfully");
      queryClient.invalidateQueries(["inventory", pharmacyId]);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Failed to add stock");
    },
  });

  return {
    useInventoryQuery: () =>
      useQuery({
        queryKey: ["inventory", pharmacyId],
        queryFn: fetchInventory,
      }),
    addStock: addStockMutation,
  };
};
