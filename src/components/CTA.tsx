import { ctaDetails } from "@/data/cta"
import ContactForm from "./ContactForm"

const CTA: React.FC = () => {
    return (
        <section id="cta" className="">
            <div className="relative h-full w-full z-10 mx-auto py-12 sm:py-20">
                <div className="h-full w-full">
                    <div className="rounded-b-3xl opacity-95 absolute inset-0 -z-10 h-full w-full bg-black bg-[linear-gradient(to_right,#12170f_1px,transparent_1px),linear-gradient(to_bottom,#12170f_1px,transparent_1px)] bg-[size:6rem_4rem]">
                        <div className="rounded-b-3xl absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_600px_at_50%_500px,rgba(0,0,0,0.3),transparent)]"></div>
                    </div>

                    <div className="h-full flex flex-col items-center justify-center text-white text-center px-5 py-8">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl md:leading-tight font-semibold mb-4 max-w-2xl">{ctaDetails.heading}</h2>

                        <div className="w-full max-w-2xl">
                            <ContactForm variant="dark" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTA