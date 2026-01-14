import { useQuery } from "@tanstack/react-query";
import instance from "../utils/instance";

export const useDelivery = () => {
  const fetchActiveDeliveries = async () => {
    const { data } = await instance.get("/deliveries/active");
    return data;
  };

  const fetchHistory = async () => {
    const { data } = await instance.get("/deliveries/history");
    return data;
  };

  return {
    useActiveDeliveriesQuery: () =>
      useQuery({
        queryKey: ["deliveries", "active"],
        queryFn: fetchActiveDeliveries,
      }),
    useHistoryQuery: () =>
      useQuery({
        queryKey: ["deliveries", "history"],
        queryFn: fetchHistory,
      }),
  };
};
