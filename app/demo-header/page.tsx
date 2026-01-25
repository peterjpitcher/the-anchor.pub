import { HeroWrapper } from '@/components/hero'
import { Section } from '@/components/ui'

export default function DemoHeaderPage() {
  return (
    <>
      <HeroWrapper
        route="/demo-header"
        title="Demo Header Page"
        description="This page demonstrates the new header image system"
        size="small"
        showStatusBar={true}
      />
      
      <Section spacing="lg" container className="bg-white">
        <h2 className="text-3xl font-bold mb-4">How to Use Page Headers</h2>
        <ol className="list-decimal list-inside space-y-2 max-w-3xl">
          <li>Place any image file in the corresponding folder in <code className="bg-gray-100 px-2 py-1 rounded">/public/images/page-headers/[folder-name]/</code></li>
          <li>The folder name matches the route (e.g., <code className="bg-gray-100 px-2 py-1 rounded">whats-on</code> for <code className="bg-gray-100 px-2 py-1 rounded">/whats-on</code>)</li>
          <li>The image can have any name - the system will find the first image in the folder</li>
          <li>Supported formats: .jpg, .jpeg, .png, .webp</li>
          <li>If no image is found, a default image will be used</li>
        </ol>
        
        <h3 className="text-2xl font-bold mt-8 mb-4">Available Folders:</h3>
        <ul className="list-disc list-inside space-y-1 max-w-3xl">
          <li><code className="bg-gray-100 px-2 py-1 rounded">home/</code> - Homepage</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">whats-on/</code> - What's On page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">food-menu/</code> - Food Menu page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">drinks/</code> - Drinks page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">sunday-lunch/</code> - Sunday Lunch page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">find-us/</code> - Find Us page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">private-hire/</code> - Private Hire page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">near-heathrow-terminal-[1-5]/</code> - Terminal pages</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">hotel-near-heathrow/</code> - Hotels page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">taxi-from-heathrow/</code> - Taxi page</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">parking-near-heathrow/</code> - Parking page</li>
        </ul>
      </Section>
    </>
  )
}
