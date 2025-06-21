import { LucideProps, User } from "lucide-react";

export const Icons = {
    user: User,
    logo: (props: LucideProps) => (
//         <svg {...props} viewBox='0 0 24 24' xmlns="http://www.w3.org/2000/svg">
//   <defs>
//     <linearGradient id="crystalGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
//       <stop offset="0%" style={{ stopColor: "#8B5CF6", stopOpacity: 1 }} />
//       <stop offset="50%" style={{ stopColor: "#6366F1", stopOpacity: 1 }} />
//       <stop offset="100%" style={{ stopColor: "#3B82F6", stopOpacity: 1 }} />
//     </linearGradient>
//     <linearGradient id="crystalGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
//       <stop offset="0%" style={{ stopColor: "#A855F7", stopOpacity: 1 }} />
//       <stop offset="100%" style={{ stopColor: "#6366F1", stopOpacity: 1 }} />
//     </linearGradient>
//     <linearGradient id="crystalGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
//       <stop offset="0%" style={{ stopColor: "#6366F1", stopOpacity: 1 }} />
//       <stop offset="100%" style={{ stopColor: "#1E40AF", stopOpacity: 1 }} />
//     </linearGradient>
//   </defs>
  

//   <polygon points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" 
//            fill="none" stroke="url(#crystalGradient1)" stroke-width="0.5" opacity="0.3"/>
  

//   <polygon points="12,2 8,6 12,8 16,6" fill="url(#crystalGradient1)" opacity="0.8"/>
  

//   <polygon points="4,6.5 8,6 12,8 8,12" fill="url(#crystalGradient2)" opacity="0.7"/>

//   <polygon points="16,6 20,6.5 16,12 12,8" fill="url(#crystalGradient3)" opacity="0.7"/>

//   <polygon points="8,12 12,8 16,12 12,16" fill="url(#crystalGradient1)" opacity="0.9"/>

//   <polygon points="4,17.5 8,12 12,16 8,18" fill="url(#crystalGradient2)" opacity="0.6"/>
  

//   <polygon points="20,17.5 16,12 12,16 16,18" fill="url(#crystalGradient3)" opacity="0.6"/>
  

//   <polygon points="8,18 12,16 16,18 12,22" fill="url(#crystalGradient1)" opacity="0.5"/>
  
//   <path d="M8,6 L12,8 L16,6 M8,12 L12,8 L16,12 M8,12 L12,16 L16,12 M8,18 L12,16 L16,18" 
//         stroke="url(#crystalGradient1)" stroke-width="0.3" fill="none" opacity="0.6"/>
// </svg>
// option 2
<svg {...props} viewBox='0 0 24 24' xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{ stopColor: "#8B5CF6", stopOpacity: 0.8 }} />
      <stop offset="100%" style={{ stopColor: "#3B82F6", stopOpacity: 0.9 }} />
    </linearGradient>
    <linearGradient id="secondary" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{ stopColor: "#6366F1", stopOpacity: 0.7 }} />
      <stop offset="100%" style={{ stopColor: "#1E40AF", stopOpacity: 0.8 }} />
    </linearGradient>
  </defs>
  
  {/* Main hexagonal crystal shape */}
  <polygon points="12,3 19,7 19,17 12,21 5,17 5,7" 
           fill="url(#primary)" stroke="url(#secondary)" strokeWidth="0.5"/>
  
  {/* Top inner triangle */}
  <polygon points="12,3 9,7.5 12,9 15,7.5" fill="url(#secondary)" opacity="0.6"/>
  
  {/* Center diamond */}
  <polygon points="9,10 12,9 15,10 12,14" fill="url(#primary)" opacity="0.7"/>
  
  {/* Bottom inner triangle */}
  <polygon points="9,16.5 12,14 15,16.5 12,21" fill="url(#secondary)" opacity="0.5"/>
  
  {/* Subtle inner lines */}
  <path d="M9,7.5 L12,9 L15,7.5 M9,10 L12,14 L15,10 M9,16.5 L12,14 L15,16.5" 
        stroke="currentColor" strokeWidth="0.2" fill="none" opacity="0.3"/>
</svg>
    )
}