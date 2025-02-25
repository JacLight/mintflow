import * as iconFa from "react-icons/fa";
import * as iconAi from "react-icons/ai";
import * as iconBs from "react-icons/bs";
import * as iconBi from "react-icons/bi";
import * as iconCi from "react-icons/ci";
import * as iconDi from "react-icons/di";
import * as iconFi from "react-icons/fi";
import * as iconFc from "react-icons/fc";
import * as iconGi from "react-icons/gi";
import * as iconGo from "react-icons/go";
import * as iconGr from "react-icons/gr";
import * as iconHi from "react-icons/hi";
import * as iconHi2 from "react-icons/hi2";
import * as iconIm from "react-icons/im";
import * as iconIo from "react-icons/io";
import * as iconIo5 from "react-icons/io5";
import * as iconMd from "react-icons/md";
import * as iconRx from "react-icons/rx";
import * as iconRi from "react-icons/ri";
import * as iconSi from "react-icons/si";
import * as iconSl from "react-icons/sl";
import * as iconTb from "react-icons/tb";
import * as iconTfi from "react-icons/tfi";
import * as iconTi from "react-icons/ti";
import * as iconVsc from "react-icons/vsc";
import * as iconWi from "react-icons/wi";
import * as iconCg from "react-icons/cg";
import * as iconFa6 from "react-icons/fa6";
import * as iconPi from "react-icons/pi";
import * as iconLu from "react-icons/lu";

const icons = {
    ...iconFa,
    ...iconFa6,
    ...iconAi,
    ...iconBs,
    ...iconBi,
    ...iconCi,
    ...iconDi,
    ...iconFi,
    ...iconFc,
    ...iconGi,
    ...iconGo,
    ...iconGr,
    ...iconHi,
    ...iconHi2,
    ...iconIm,
    ...iconIo,
    ...iconIo5,
    ...iconMd,
    ...iconRx,
    ...iconRi,
    ...iconSi,
    ...iconSl,
    ...iconTb,
    ...iconTfi,
    ...iconTi,
    ...iconVsc,
    ...iconWi,
    ...iconCg,
    ...iconPi,
    ...iconLu,
} as const;

export type IconKeys = keyof typeof icons;

export const Icon = (props: {
    name: IconKeys;
    size?: number;
    color?: string;
    className?: string;
    style?: any;
    ref?: React.Ref<SVGSVGElement>;
    onClick?: () => void;
}) => {
    const SelectedIcon = icons[props.name] as any;
    if (!SelectedIcon) return null;
    return (
        <SelectedIcon
            style={props.style}
            size={props.size}
            color={props.color}
            className={props.className}
            aria-hidden={true}
            ref={props.ref}
            onClick={props.onClick}
        />
    );
};

export default Icon;
