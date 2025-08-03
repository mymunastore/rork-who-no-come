// This file is needed for the tab layout but redirects to the actual create-delivery screen
import { Redirect } from "expo-router";

export default function CreateDeliveryTab() {
  return <Redirect href="/create-delivery" />;
}