"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface FeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
}

export const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
	const ref = useRef<HTMLDivElement>(null);

	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseXSpring = useSpring(x);
	const mouseYSpring = useSpring(y);

	const rotateX = useTransform(
		mouseYSpring,
		[-0.5, 0.5],
		["17.5deg", "-17.5deg"],
	);
	const rotateY = useTransform(
		mouseXSpring,
		[-0.5, 0.5],
		["-17.5deg", "17.5deg"],
	);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = ref.current?.getBoundingClientRect();
		if (rect) {
			const width = rect.width;
			const height = rect.height;
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const xPct = mouseX / width - 0.5;
			const yPct = mouseY / height - 0.5;
			x.set(xPct);
			y.set(yPct);
		}
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				rotateX,
				rotateY,
				transformStyle: "preserve-3d",
			}}
			className="relative h-72 w-72 rounded-xl bg-gradient-to-br from-primary/5 to-primary/30 p-8"
		>
			<div style={{ transform: "translateZ(75px)" }} className="space-y-4">
				<div className="text-primary">{icon}</div>
				<h3 className="text-xl font-bold">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</motion.div>
	);
};
