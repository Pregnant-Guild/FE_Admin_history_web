"use client";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { UserMetaCardProps } from "@/interface/user";
import { apiGetCurrentUser } from "@/service/auth";
import { apiGetCurrentUserMedia } from "@/service/userService";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Profile() {
  const [user, setUser] = useState<UserMetaCardProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await apiGetCurrentUser();
        const mediaResult = await apiGetCurrentUserMedia();
        console.log("Current User:", result);
        console.log("User Media:", mediaResult);
        setUser(result);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard data={user ?? {}} />
          <UserInfoCard data={user ?? {}} />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
