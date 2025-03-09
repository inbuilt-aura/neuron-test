// "use client";

// import { useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { useSelector } from "react-redux";
// import { RootState } from "@/src/store/store";
// import React from "react";

// type UserRole = "SALES" | "CLIENT" | "MANAGER" | "RESEARCHER";

// export function withAuth<P extends object>(
//   WrappedComponent: React.ComponentType<P>,
//   allowedRoles: UserRole[]
// ) {
//   return function AuthenticatedComponent(props: P) {
//     const router = useRouter();
//     const pathname = usePathname();
//     const { user, token, isAuthenticated } = useSelector(
//       (state: RootState) => state.auth
//     );

//     useEffect(() => {
//       if (!isAuthenticated || !token) {
//         router.replace("/");
//         return;
//       }

//       // Check if token is expired
//       const currentTime = Math.floor(Date.now() / 1000);
//       if (
//         token.access.expires &&
//         currentTime > new Date(token.access.expires).getTime() / 1000
//       ) {
//         // Token has expired, logout user and redirect to login
//         // You should dispatch the logout action here
//         router.replace("/");
//         return;
//       }

//       // Check user role and redirect accordingly
//       if (user && !allowedRoles.includes(user.role as UserRole)) {
//         router.replace("/unauthorized");
//       } else if (user) {
//         if (user.role === "SALES" && pathname === "/") {
//           router.replace("/sale/lead");
//         } else if (user.role === "CLIENT" && pathname === "/") {
//           router.replace("/client/project");
//         }
//       }
//     }, [isAuthenticated, token, user, router, pathname]);

//     if (!isAuthenticated || !token || !user) {
//       return null; // or a loading spinner
//     }

//     return <WrappedComponent {...props} />;
//   };
// }
