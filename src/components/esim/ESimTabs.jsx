import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NumberSearch from "@/pages/NumberSearch";
import MyESims from "@/pages/MyESims";
import ESimStore from "@/pages/ESimStore";
import { ShoppingCart, Wifi, Package } from "lucide-react";

export default function ESimTabs() {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <TabsList className="sticky top-0 z-10 w-full grid grid-cols-3 bg-[#0d2137] border-b border-gray-800 rounded-none">
          <TabsTrigger value="buy-esim" className="flex items-center gap-2 rounded-none">
            <Package className="w-4 h-4" />
            Buy eSIM
          </TabsTrigger>
          <TabsTrigger value="buy" className="flex items-center gap-2 rounded-none">
            <ShoppingCart className="w-4 h-4" />
            Buy Numbers
          </TabsTrigger>
          <TabsTrigger value="my-esims" className="flex items-center gap-2 rounded-none">
            <Wifi className="w-4 h-4" />
            My eSIMs
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="buy-esim" className="h-full m-0">
            <ESimStore />
          </TabsContent>

          <TabsContent value="buy" className="h-full m-0">
            <NumberSearch />
          </TabsContent>

          <TabsContent value="my-esims" className="h-full m-0">
            <MyESims />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}