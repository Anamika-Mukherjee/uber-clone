//user profile management page where users can update their profile
"use client";
import ManageAccount from "@/components/ManageAccount";

export default function UserProfilePage() {
  return (
    <div className="w-screen h-full flex flex-col justify-center items-center">
      <ManageAccount />
    </div>
  );
}
