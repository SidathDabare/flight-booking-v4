"use client";

import { useSession, signOut } from "next-auth/react";
import { CircleUserRound, Menu, LogOut, Mail } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadMessages } from "@/lib/unread-messages-context";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export const ClientNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { unreadCount } = useUnreadMessages();
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const t = useTranslations("common");
  //const [query, setQuery] = useState("");

  // Close mobile menu on route change
  useEffect(() => {
    setDropdownMenu(false);
  }, [pathname]);

  return (
    <div className="fixed top-2 mt-0 z-50 w-full flex justify-center items-center navbar-bg">
      {/* <div className="py-2 px-10 flex gap-2 justify-between items-center backdrop-blur-md border border-sky-500 max-sm:px-4 rounded-full w-11/12 mx-auto"> */}
      <div className="py-2 px-10 flex gap-2 justify-between items-center rounded-full w-11/12 max-sm:w-[95%] max-sm:px-3">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={120} height={60} />
        </Link>

        <div className="hidden lg:flex gap-4 text-base-bold">
          <Link
            href="/"
            className={`hover:text-red-1 ${
              pathname === "/" && "font-bold underline"
            }`}
          >
            {t("home")}
          </Link>
          <Link
            href="/about"
            className={`hover:text-red-1 ${
              pathname === "/about" && "font-bold underline"
            }`}
          >
            {t("about")}
          </Link>
          <Link
            href="/services"
            className={`hover:text-red-1 ${
              pathname === "/services" && "font-bold underline"
            }`}
          >
            {t("services")}
          </Link>
          {/* <Link
            href="/testPage"
            className={`hover:text-red-1 ${
              pathname === "/contact-page" && "font-bold underline"
            }`}
          >
            Test Page
          </Link> */}
          {/* <Link
            href="/contact-page"
            className={`hover:text-red-1 ${
              pathname === "/contact-page" && "text-black font-bold underline"
            }`}
          >
            Contact Us
          </Link>
          <Link
            href="/privacy"
            className={`hover:text-red-1 ${
              pathname === "/privacy" && "text-black font-bold underline"
            }`}
          >
            Privacy
          </Link> */}

          {/* {session && (
            <Link
              href="/wishlist"
              className={`hover:underline ${
                pathname === "/wishlist" && "font-bold underline"
              }`}
            >
              Wishlist
            </Link>
          )}

          {session && (
            <Link
              href="/orders"
              className={`hover:underline ${
                pathname === "/orders" && "font-bold underline"
              }`}
            >
              Orders
            </Link>
          )} */}

          {/* {isAdmin && (
            <Link
              href="/admin"
              className={`hover:underline ${
                pathname === "/admin" && "text-black font-bold underline"
              }`}
            >
              Admin Dashboard
            </Link>
          )} */}
        </div>

        {/* notify if any unread messages */}
        <div className="relative flex gap-3 items-center">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* {session && (
            <div
              onClick={() => router.push(`/${session.user.role}/messages`)}
              className="hidden lg:flex items-center gap-2 hover:text-red-1 cursor-pointer relative"
            >
              <Mail strokeWidth={1} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          )} */}

          {/* <Link
            href={session ? "/cart" : "/auth/signin"}
            className="hidden lg:flex items-center gap-3 px-2 py-1 hover:text-white relative "
          >
            <Mail
              strokeWidth={1}
              className="hover:font-bold hover:scale-105 transition-all"
            />
          </Link> */}

          {session ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-8 w-8 ">
                  <UserAvatar
                    src={session.user.profileImage}
                    name={session.user.name}
                    email={session.user.email}
                    size="md"
                    className="border border-sky-500 shining-button"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-70 p-0 rounded-sm min-w-100 md:min-w-[380px]"
              >
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      src={session.user.profileImage}
                      name={session.user.name}
                      email={session.user.email}
                      size="lg"
                    />
                    <div className="flex-1 px-2">
                      <div className="font-semibold text-gray-900 truncate">
                        {session.user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <DropdownMenuItem
                    asChild
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <Link
                      href={`/${session.user.role}`}
                      className="flex items-center w-full"
                    >
                      {session.user.role === "admin"
                        ? t("dashboard.admin")
                        : session.user.role === "agent"
                          ? t("dashboard.agent")
                          : t("dashboard.user")}
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role !== "client" && (
                    <DropdownMenuItem
                      asChild
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <Link
                        href={`/${session.user.role}/profile`}
                        className="flex items-center w-full"
                      >
                        {t("profile")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    asChild
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <Link
                      href={`/${session.user.role}/messages`}
                      className="flex items-center w-full"
                    >
                      {/* <MessageSquare className="mr-2 h-4 w-4" /> */}
                      {t("messages")}
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-t border-gray-200 my-1"></div>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/signin"
              className="border border-sky-500 text-blue-500 rounded-full w-7 h-7 flex items-center justify-center"
            >
              <CircleUserRound className="text-gray-400" />
            </Link>
          )}

          <Menu
            strokeWidth={1}
            className="cursor-pointer lg:hidden"
            onClick={() => setDropdownMenu(!dropdownMenu)}
          />
        </div>
      </div>
      {/* Full-Screen Dropdown Menu */}

      {dropdownMenu && (
        <div className="lg:hidden fixed -top-2 left-0 w-full h-screen navbar-bg-mobile bg-opacity-90 transition-opacity duration-600 ease-in-out z-[60]">
          <div className="w-full flex px-5 relative">
            <X
              className="cursor-pointer absolute top-4 right-4"
              onClick={() => setDropdownMenu(false)}
            />
          </div>
          <div className="inset-0 flex flex-col items-center justify-center h-full">
            <div className="flex flex-col gap-4 p-6 text-lg">
              <Link
                href="/"
                className={`hover:text-red-1 ${
                  pathname === "/" && "font-bold underline"
                }`}
                onClick={() => setDropdownMenu(!dropdownMenu)}
              >
                {t("home")}
              </Link>
              <Link
                href="/about"
                className={`hover:text-red-1 ${
                  pathname === "/about" && "font-bold underline"
                }`}
                onClick={() => setDropdownMenu(!dropdownMenu)}
              >
                {t("about")}
              </Link>
              <Link
                href="/services"
                className={`hover:text-red-1 ${
                  pathname === "/services" && "font-bold underline"
                }`}
                onClick={() => setDropdownMenu(!dropdownMenu)}
              >
                {t("services")}
              </Link>
              {session && (
                <div
                  onClick={() => {
                    setDropdownMenu(false);
                    router.push(`/${session.user.role}/messages`);
                  }}
                  className="flex items-center gap-2 hover:text-red-1 cursor-pointer relative"
                >
                  {/* <Mail strokeWidth={1} /> */}
                  {t("messages")}
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              )}
              {/* <Link
                href="/contact-page"
                className={`hover:text-red-1 ${
                  pathname === "/contact-page" &&
                  "text-white font-bold underline"
                }`}
                onClick={() => setDropdownMenu(!dropdownMenu)}
              >
                Contact Us
              </Link> */}
              {/* <Link
                href="/privacy"
                className={`hover:text-red-1 ${
                  pathname === "/privacy" && "text-white font-bold underline"
                }`}
                onClick={() => setDropdownMenu(!dropdownMenu)}
              >
                Privacy
              </Link>

              {session && (
                <Link
                  href="/wishlist"
                  className={`hover:underline ${
                    pathname === "/wishlist" && "text-white font-bold underline"
                  }`}
                  onClick={() => setDropdownMenu(!dropdownMenu)}
                >
                  Wishlist
                </Link>
              )}

              {session && (
                <Link
                  href="/orders"
                  className={`hover:underline ${
                    pathname === "/orders" && "text-white font-bold underline"
                  }`}
                  onClick={() => setDropdownMenu(!dropdownMenu)}
                >
                  Orders
                </Link>
              )}
              <div
                onClick={() => {
                  setDropdownMenu(false);
                  router.push("/cart");
                }}
                className="flex items-center gap-2 hover:text-red-1 cursor-pointer"
              >
                <ShoppingBag strokeWidth={1} />
                Cart
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientNavbar;
