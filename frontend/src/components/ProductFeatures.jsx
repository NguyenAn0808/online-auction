import { Fragment } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

const tabs = [
  {
    id: 1,
    name: "Design",
    features: [
      {
        name: "Adaptive and modular",
        description:
          "The Organize base set allows you to configure and evolve your setup as your items and habits change. The included trays and optional add-ons are easily rearranged to achieve that perfect setup.",
        imageSrc:
          "https://tailwindui.com/plus-assets/img/ecommerce-images/product-feature-06-detail-01.jpg",
        imageAlt:
          "Maple organizer base with slots, supporting white polycarbonate trays of various sizes.",
      },
    ],
  },
  {
    name: "Material",
    features: [
      {
        name: "Natural wood options",
        description:
          "Organize has options for rich walnut and bright maple base materials. Accent your desk with a contrasting material, or match similar woods for a calm and cohesive look. Every base is hand sanded and finished.",
        imageSrc:
          "https://tailwindui.com/plus-assets/img/ecommerce-images/product-feature-06-detail-02.jpg",
        imageAlt:
          "Walnut organizer base with pen, sticky note, phone, and bin trays, next to modular drink coaster attachment.",
      },
    ],
  },
  {
    name: "Considerations",
    features: [
      {
        name: "Helpful around the home",
        description:
          "Our customers use Organize throughout the house to bring efficiency to many daily routines. Enjoy Organize in your workspace, kitchen, living room, entry way, garage, and more. We can't wait to see how you'll use it!",
        imageSrc:
          "https://tailwindui.com/plus-assets/img/ecommerce-images/product-feature-06-detail-03.jpg",
        imageAlt:
          "Walnut organizer base with white polycarbonate trays in the kitchen with various kitchen utensils.",
      },
    ],
  },
  {
    name: "Included",
    features: [
      {
        name: "Everything you'll need",
        description:
          "The Organize base set includes the pen, phone, small, and large trays to help you group all your essential items. Expand your set with the drink coaster and headphone stand add-ons.",
        imageSrc:
          "https://tailwindui.com/plus-assets/img/ecommerce-images/product-feature-06-detail-04.jpg",
        imageAlt:
          "Walnut organizer system on black leather desk mat on top of white desk.",
      },
    ],
  },
];

export default function ProductFeatures() {
  return (
    <>
      <section aria-labelledby="features-heading">
        <div style={{ maxWidth: "800px" }}>
          <h2
            id="features-heading"
            style={{
              fontSize: TYPOGRAPHY.SIZE_HEADING_XL,
              fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
              color: COLORS.MIDNIGHT_ASH,
            }}
          >
            Item Specifications
          </h2>
          <p
            style={{
              marginTop: SPACING.M,
              fontSize: TYPOGRAPHY.SIZE_BODY,
              color: COLORS.PEBBLE,
            }}
          >
            The Organize modular system offers endless options for arranging
            your favorite and most used items. Keep everything at reach and in
            its place, while dressing up your workspace.
          </p>
        </div>

        <TabGroup style={{ marginTop: SPACING.M }}>
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              marginLeft: "-16px",
              marginRight: "-16px",
            }}
          >
            <div
              style={{
                flex: 1,
                borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                paddingLeft: SPACING.M,
                paddingRight: SPACING.M,
              }}
            >
              <TabList
                style={{
                  display: "flex",
                  gap: SPACING.L,
                  marginBottom: "-1px",
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className="data-selected:border-b-2 data-selected:text-midnight-ash"
                    style={{
                      borderBottom: "2px solid transparent",
                      paddingTop: SPACING.L,
                      paddingBottom: SPACING.L,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      whiteSpace: "nowrap",
                      color: COLORS.PEBBLE,
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab.name}
                  </Tab>
                ))}
              </TabList>
            </div>
          </div>

          <TabPanels as={Fragment}>
            {tabs.map((tab) => (
              <TabPanel
                key={tab.name}
                style={{
                  display: "grid",
                  gap: SPACING.L,
                  paddingTop: SPACING.L,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingBottom: 0,
                }}
              >
                {tab.features.map((feature) => (
                  <div
                    key={feature.name}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: SPACING.L,
                    }}
                  >
                    <div style={{ paddingTop: SPACING.M }}>
                      <h3
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: COLORS.MIDNIGHT_ASH,
                        }}
                      >
                        {feature.name}
                      </h3>
                      <p
                        style={{
                          marginTop: SPACING.S,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        {feature.description}
                      </p>
                    </div>
                    <div>
                      <img
                        alt={feature.imageAlt}
                        src={feature.imageSrc}
                        style={{
                          width: "100%",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          backgroundColor: COLORS.SOFT_CLOUD,
                          objectFit: "cover",
                          aspectRatio: "5/2",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </section>
    </>
  );
}
