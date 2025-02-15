"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
	{
		content:
			"The most intuitive blockchain management platform I've ever used. It's revolutionized our workflow.",
		author: "Sarah Chen",
		title: "CTO at BlockTech",
		avatar: "SC",
	},
	{
		content:
			"Security and speed combined. TOM3 Console has become an essential part of our daily operations.",
		author: "Michael Roberts",
		title: "Lead Developer at CryptoFlow",
		avatar: "MR",
	},
	{
		content:
			"The automation features have saved us countless hours. Highly recommended for any Web3 team.",
		author: "Jessica Wang",
		title: "Product Manager at DeFiHub",
		avatar: "JW",
	},
];

export const TestimonialCarousel = () => {
	const [current, setCurrent] = useState(0);
	const [direction, setDirection] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setDirection(1);
			setCurrent((prev) => (prev + 1) % testimonials.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	const slideVariants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
		}),
		center: {
			zIndex: 1,
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			zIndex: 0,
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
		}),
	};

	const swipeConfidenceThreshold = 10000;
	const swipePower = (offset: number, velocity: number) => {
		return Math.abs(offset) * velocity;
	};

	const paginate = (newDirection: number) => {
		setDirection(newDirection);
		setCurrent(
			(prev) =>
				(prev + newDirection + testimonials.length) % testimonials.length,
		);
	};

	return (
		<div className="relative w-full max-w-4xl mx-auto">
			<div className="relative h-[300px] overflow-hidden">
				<AnimatePresence initial={false} custom={direction}>
					<motion.div
						key={current}
						custom={direction}
						variants={slideVariants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{
							x: { type: "spring", stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
						}}
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={1}
						onDragEnd={(e, { offset, velocity }) => {
							const swipe = swipePower(offset.x, velocity.x);
							if (swipe < -swipeConfidenceThreshold) {
								paginate(1);
							} else if (swipe > swipeConfidenceThreshold) {
								paginate(-1);
							}
						}}
						className="absolute w-full"
					>
						<div className="flex flex-col items-center text-center px-6">
							<Quote className="w-12 h-12 text-primary/20 mb-6" />
							<p className="text-xl md:text-2xl font-medium mb-8 text-foreground/80">
								"{testimonials[current].content}"
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
									{testimonials[current].avatar}
								</div>
								<div className="text-left">
									<div className="font-semibold">
										{testimonials[current].author}
									</div>
									<div className="text-sm text-muted-foreground">
										{testimonials[current].title}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			<button
				className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/80 transition-colors"
				onClick={() => paginate(-1)}
			>
				<ChevronLeft className="w-5 h-5" />
			</button>
			<button
				className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/80 transition-colors"
				onClick={() => paginate(1)}
			>
				<ChevronRight className="w-5 h-5" />
			</button>
		</div>
	);
};
