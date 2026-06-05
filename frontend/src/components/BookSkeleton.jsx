import React from "react";

// Shimmer base style
const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    style={{
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite linear",
    }}
  />
);

// ────────────────────────────────────────────────────────────
// Card Skeleton  (grid view)
// ────────────────────────────────────────────────────────────
export const BookCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    {/* Cover image */}
    <Shimmer className="w-full aspect-[3/4] rounded-none" />
    {/* Body */}
    <div className="p-4 space-y-3">
      <Shimmer className="h-4 w-3/4 rounded-lg" />
      <Shimmer className="h-3 w-1/2 rounded-lg" />
      <div className="flex justify-between items-center pt-1">
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-5 w-12 rounded-lg" />
      </div>
      <Shimmer className="h-8 w-full rounded-xl mt-1" />
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// List Row Skeleton  (list view in BrowseBooks)
// ────────────────────────────────────────────────────────────
export const BookListSkeleton = () => (
  <div className="flex flex-col sm:flex-row bg-white border border-gray-100 rounded-2xl overflow-hidden">
    <Shimmer className="w-full sm:w-48 aspect-[3/4] sm:aspect-[4/5] rounded-none flex-shrink-0" />
    <div className="p-6 flex flex-col justify-between flex-grow gap-4">
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2 flex-grow">
            <Shimmer className="h-5 w-3/4 rounded-lg" />
            <Shimmer className="h-3.5 w-1/3 rounded-lg" />
          </div>
          <Shimmer className="h-7 w-16 rounded-full ml-4 flex-shrink-0" />
        </div>
        <Shimmer className="h-3 w-full rounded-lg" />
        <Shimmer className="h-3 w-4/5 rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex gap-2">
          <Shimmer className="h-5 w-16 rounded-lg" />
          <Shimmer className="h-5 w-20 rounded-lg" />
        </div>
        <Shimmer className="h-5 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Book Details Page Skeleton
// ────────────────────────────────────────────────────────────
export const BookDetailsSkeleton = () => (
  <div className="max-w-5xl mx-auto py-8 px-4 animate-pulse">
    {/* Breadcrumb */}
    <Shimmer className="h-4 w-32 rounded-lg mb-8" />

    <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
      {/* Cover */}
      <div className="w-full md:w-2/5 max-w-sm mx-auto md:mx-0 flex-shrink-0">
        <Shimmer className="w-full aspect-[3/4] rounded-2xl" />
      </div>

      {/* Details */}
      <div className="flex-grow w-full space-y-6">
        {/* Category + condition pills */}
        <div className="flex gap-2 mb-3">
          <Shimmer className="h-5 w-20 rounded-lg" />
          <Shimmer className="h-5 w-24 rounded-lg" />
        </div>
        {/* Title */}
        <Shimmer className="h-9 w-4/5 rounded-xl" />
        <Shimmer className="h-5 w-2/5 rounded-lg" />

        {/* Price box */}
        <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <Shimmer className="h-3 w-24 rounded" />
            <Shimmer className="h-8 w-32 rounded-lg" />
          </div>
          <Shimmer className="h-8 w-28 rounded-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Shimmer className="h-3 w-24 rounded" />
          <Shimmer className="h-4 w-full rounded-lg" />
          <Shimmer className="h-4 w-5/6 rounded-lg" />
          <Shimmer className="h-4 w-4/5 rounded-lg" />
        </div>

        {/* Owner */}
        <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl">
          <Shimmer className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-20 rounded" />
            <Shimmer className="h-4 w-32 rounded-lg" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-gray-100">
          <Shimmer className="h-12 w-52 rounded-2xl" />
          <Shimmer className="h-12 w-12 rounded-2xl" />
          <Shimmer className="h-12 w-52 rounded-2xl" />
        </div>

        {/* Guarantee row */}
        <div className="pt-4 grid grid-cols-3 gap-3 border-t border-gray-50">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Shimmer className="h-5 w-5 rounded" />
              <Shimmer className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Wishlist Row Skeleton
// ────────────────────────────────────────────────────────────
export const WishlistRowSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 gap-4">
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <Shimmer className="w-16 h-20 rounded-xl flex-shrink-0" />
      <div className="space-y-2 flex-grow">
        <Shimmer className="h-4 w-48 rounded-lg" />
        <Shimmer className="h-3 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Shimmer className="h-4 w-16 rounded-lg" />
          <Shimmer className="h-4 w-16 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
      <Shimmer className="h-6 w-16 rounded-lg" />
      <Shimmer className="h-9 w-28 rounded-xl" />
      <Shimmer className="h-9 w-9 rounded-xl" />
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// UserPanel — My Books Shelf Skeleton
// ────────────────────────────────────────────────────────────
export const UserBookCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
    <Shimmer className="w-full aspect-[3/4] rounded-none" />
    <div className="p-4 space-y-2">
      <Shimmer className="h-4 w-3/4 rounded-lg" />
      <Shimmer className="h-3 w-1/2 rounded-lg" />
      <div className="flex gap-2 pt-1">
        <Shimmer className="h-5 w-14 rounded-full" />
        <Shimmer className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Shimmer className="h-8 flex-1 rounded-xl" />
        <Shimmer className="h-8 w-8 rounded-xl" />
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Order Row Skeleton
// ────────────────────────────────────────────────────────────
export const OrderRowSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <Shimmer className="h-3.5 w-32 rounded-lg" />
        <Shimmer className="h-3 w-24 rounded-lg" />
      </div>
      <Shimmer className="h-6 w-20 rounded-full" />
    </div>
    <div className="flex gap-4 items-center">
      <Shimmer className="w-12 h-16 rounded-lg flex-shrink-0" />
      <div className="space-y-2 flex-grow">
        <Shimmer className="h-4 w-3/4 rounded-lg" />
        <Shimmer className="h-3 w-1/2 rounded-lg" />
      </div>
      <Shimmer className="h-5 w-16 rounded-lg flex-shrink-0" />
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Swap Row Skeleton
// ────────────────────────────────────────────────────────────
export const SwapRowSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5">
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="flex items-center gap-4 flex-grow">
        <Shimmer className="w-14 h-18 rounded-xl flex-shrink-0" />
        <div className="space-y-2">
          <Shimmer className="h-4 w-40 rounded-lg" />
          <Shimmer className="h-3 w-28 rounded-lg" />
        </div>
      </div>
      <Shimmer className="h-5 w-16 rounded-full flex-shrink-0" />
      <div className="flex items-center gap-4 flex-grow">
        <Shimmer className="w-14 h-18 rounded-xl flex-shrink-0" />
        <div className="space-y-2">
          <Shimmer className="h-4 w-40 rounded-lg" />
          <Shimmer className="h-3 w-28 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Shimmer className="h-9 w-24 rounded-xl" />
        <Shimmer className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Cart Item Skeleton
// ────────────────────────────────────────────────────────────
export const CartItemSkeleton = () => (
  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
    <Shimmer className="w-16 h-20 rounded-xl flex-shrink-0" />
    <div className="flex-grow space-y-2">
      <Shimmer className="h-4 w-3/4 rounded-lg" />
      <Shimmer className="h-3 w-1/3 rounded-lg" />
      <div className="flex gap-2 pt-1">
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
    </div>
    <div className="space-y-2 text-right flex-shrink-0">
      <Shimmer className="h-5 w-16 rounded-lg" />
      <Shimmer className="h-8 w-8 rounded-xl ml-auto" />
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Default export  (backwards compatibility)
// ────────────────────────────────────────────────────────────
const BookSkeleton = BookCardSkeleton;
export default BookSkeleton;

// Inject shimmer keyframe once
if (typeof document !== "undefined" && !document.getElementById("shimmer-style")) {
  const style = document.createElement("style");
  style.id = "shimmer-style";
  style.textContent = `
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
  `;
  document.head.appendChild(style);
}