//layout for auth pages (sign in and sign up pages)
import Header from "@/components/Header";
import React from "react";

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="w-screen min-h-screen h-auto flex flex-col justify-start items-center">
      <Header />
      {children}
    </div>
  )
}

export default Layout;
