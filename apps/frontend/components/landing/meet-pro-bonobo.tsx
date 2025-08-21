"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel } from "@/components/ui/carousel"
import { SlideIn } from "@/components/ui/slide-in"

export function MeetProBonobo() {
  const capabilities = [
    {
      title: "Immediate Turnaround",
      description: "Get your relocation analysis instantly, 24/7. No waiting, no delays.",
      image: "/images/landing/meet_pro_bonobo/immediate_turnaround.png"
    },
    {
      title: "The Right Questions",
      description: "We ask only what matters. No fluff, just the essential questions to find your perfect new home.",
      image: "/images/landing/meet_pro_bonobo/right_questions.png"
    },
    {
      title: "Comprehensive Reports",
      description: "Clear, downloadable reports ready to share with your immigration and tax experts.",
      image: "/images/landing/meet_pro_bonobo/comprehensive_reports.png"
    },
    {
      title: "Visa Options",
      description: "Discover all available visa paths and their requirements at a glance.",
      image: "/images/landing/meet_pro_bonobo/visa_options.png"
    },
    {
      title: "Tax Implications",
      description: "Quick estimates of your potential tax savings in any new jurisdiction.",
      image: "/images/landing/meet_pro_bonobo/tax_implications.png"
    },
    {
      title: "Reuse your data",
      description: "Enter your details once, explore multiple countries. No repetitive forms.",
      image: "/images/landing/meet_pro_bonobo/reuse_data.png"
    }
  ]

  const CapabilityCard = ({ capability }: { capability: typeof capabilities[0] }) => (
    <Card className="bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-shadow duration-300 w-[300px]">
      <CardContent className="p-6">
        <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
          <Image
            src={capability.image}
            alt={capability.title}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {capability.title}
        </h3>
        <p className="text-muted-foreground">
          {capability.description}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-4">
        <SlideIn>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-center large-heading">
            Meet Mr. Pro Bonobo
          </h2>
        </SlideIn>
      </div>
      
      {/* Main container with relative positioning */}
      <div className="relative w-full">
        {/* Background image container with aspect ratio */}
        <div className="relative w-full aspect-[3/4]">
          <Image
            src="/images/landing/meet_pro_bonobo/bonobo_face.png"
            alt="Mr. Pro Bonobo's face"
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        </div>

        {/* Cards container positioned absolutely */}
        <div className="absolute inset-0">
          {/* Spacer to keep face area clear */}
          <div className="h-[48%]"></div>
          
          {/* Carousel View - always visible, allow overflow */}
          <div className="w-full overflow-visible">
            <Carousel
              items={capabilities.map((capability, index) => (
                <SlideIn key={index} delay={0.1 * index} direction="up">
                  <CapabilityCard capability={capability} />
                </SlideIn>
              ))}
              className="overflow-visible"
              itemClassName="overflow-visible"
            />
          </div>
        </div>
      </div>
    </section>
  )
} 