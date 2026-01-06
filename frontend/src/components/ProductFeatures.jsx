import { Fragment } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { COLORS, TYPOGRAPHY, SPACING } from "../constants/designSystem";

export default function ProductFeatures({ product }) {
  console.log("ProductFeatures received:", product);

  // Robustly parse specifications
  let specifications = product?.specifications;
  if (typeof specifications === "string") {
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      specifications = [];
    }
  }

  if (
    !specifications ||
    !Array.isArray(specifications) ||
    specifications.length === 0
  ) {
    return (
      <div>
        <h2
          style={{
            fontSize: TYPOGRAPHY.SIZE_HEADING,
            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
            color: COLORS.MIDNIGHT_ASH,
            marginBottom: SPACING.L,
          }}
        >
          Item Specifications
        </h2>
        <p style={{ color: COLORS.PEBBLE }}>No specifications available.</p>
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: TYPOGRAPHY.SIZE_HEADING,
          fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
          color: COLORS.MIDNIGHT_ASH,
          marginBottom: SPACING.L,
        }}
      >
        Item Specifications
      </h2>
      <TabGroup>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab List (Sidebar on Desktop) */}
          <div className="lg:w-1/4">
            <TabList className="flex gap-x-4 overflow-x-auto border-b border-gray-200 pb-4 lg:block lg:border-0 lg:pb-0">
              {specifications.map((tab) => (
                <Tab
                  key={tab?.name}
                  className={({ selected }) =>
                    `whitespace-nowrap border-b-2 px-1 py-4 text-lg font-semibold transition-colors duration-200 ease-out focus:outline-none lg:block lg:w-full lg:border-l-2 lg:border-b-0 lg:px-4 lg:py-3 lg:text-left ${
                      selected
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`
                  }
                  style={{ color: COLORS.MIDNIGHT_ASH }}
                >
                  {tab?.name}
                </Tab>
              ))}
            </TabList>
          </div>

          {/* Tab Panels (Content Area) */}
          <TabPanels className="lg:w-3/4">
            {specifications.map((tab) => (
              <TabPanel key={tab?.name} as={Fragment}>
                <div className="flex flex-col">
                  <h3 className="sr-only">{tab?.name}</h3>
                  {/* Feature List */}
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                    {tab?.features?.map((feature, featureIdx) => (
                      <div key={feature?.name || featureIdx}>
                        <dt
                          style={{
                            fontSize: "1.25rem", // Larger text
                            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          {feature?.name}
                        </dt>
                        <dd
                          style={{
                            marginTop: SPACING.S,
                            fontSize: "1.1rem", // Larger text
                            color: COLORS.PEBBLE,
                          }}
                        >
                          {feature?.description}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </div>
      </TabGroup>
    </div>
  );
}
