import { getBestSellingBadge } from '../../utils/bestSellingUtils';

/**
 * Best Selling Badge Component
 * Displays a badge for programs that are best sellers
 */
export default function BestSellingBadge({ program, className = "", size = "default" }) {
    const badge = getBestSellingBadge(program);
    
    if (!badge) return null;

    const sizeClasses = {
        small: "text-xs px-2 py-1",
        default: "text-sm px-3 py-1.5", 
        large: "text-base px-4 py-2"
    };

    return (
        <div className={`
            inline-flex items-center gap-1 rounded-full font-semibold shadow-sm
            ${badge.className}
            ${sizeClasses[size]}
            ${className}
        `}>
            <span>{badge.icon}</span>
            <span>{badge.text}</span>
        </div>
    );
}
