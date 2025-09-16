import BenefitSection from "./BenefitSection"
import VideoSection from "../VideoSection"

import { benefits } from "@/data/benefits"

const Benefits: React.FC = () => {
    return (
        <div id="features">
            <h2 className="sr-only">Features</h2>
            {benefits.map((item, index) => {
                return <BenefitSection key={index} benefit={item} imageAtRight={index % 2 !== 0} index={index} />
            })}
            <VideoSection />
        </div>
    )
}

export default Benefits