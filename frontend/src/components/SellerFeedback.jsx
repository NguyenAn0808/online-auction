import { StarIcon } from "@heroicons/react/20/solid";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

const reviews = {
  average: 4,
  totalCount: 1624,
  counts: [
    { rating: 5, count: 1019 },
    { rating: 4, count: 162 },
    { rating: 3, count: 97 },
    { rating: 2, count: 199 },
    { rating: 1, count: 147 },
  ],
  featured: [
    {
      id: 1,
      rating: 5,
      content: `<p>This is the bag of my dreams. I took it on my last vacation and was able to fit an absurd amount of snacks for the many long and hungry flights.</p>`,
      author: "Emily Selman",
      avatarSrc:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    },
  ],
};

const seller = {
  avatarSrc:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=4&w=256&h=256&q=80",
  name: "GreatSellerCo",
  positiveFeedback: "100% positive feedback",
  itemsSold: "10K items sold",
  bio: "Trusted seller with thousands of positive reviews. Ships quickly and responds promptly to questions.",
};

function SellerInfo({ seller }) {
  return (
    <div style={{ marginBottom: SPACING.L, backgroundColor: COLORS.WHITE }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: SPACING.M,
        }}
      >
        <img
          src={seller.avatarSrc}
          alt={`${seller.name} avatar`}
          style={{
            height: "56px",
            width: "56px",
            borderRadius: "50%",
          }}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                  fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                {seller.name}
              </h3>
              <p
                style={{
                  marginTop: SPACING.S,
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: COLORS.PEBBLE,
                }}
              >
                {seller.positiveFeedback} · {seller.itemsSold}
              </p>
            </div>
          </div>

          <p
            style={{
              marginTop: SPACING.M,
              fontSize: TYPOGRAPHY.SIZE_BODY,
              color: COLORS.PEBBLE,
            }}
          >
            {seller.bio}
          </p>

          <div
            style={{
              marginTop: SPACING.M,
              display: "flex",
              flexDirection: "column",
              gap: SPACING.S,
            }}
          >
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: BORDER_RADIUS.FULL,
                backgroundColor: COLORS.MIDNIGHT_ASH,
                paddingLeft: SPACING.M,
                paddingRight: SPACING.M,
                paddingTop: "4px",
                paddingBottom: "4px",
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.WHITE,
                textDecoration: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Visit Store
            </a>
            <button
              type="button"
              onClick={() => {
                if (window && typeof window.openChat === "function") {
                  const product = window.__CURRENT_PRODUCT || null;
                  try {
                    window.openChat({ product });
                  } catch (err) {
                    console.warn("openChat failed", err);
                    window.openChat();
                  }
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: BORDER_RADIUS.FULL,
                border: `1px solid ${COLORS.MORNING_MIST}`,
                backgroundColor: COLORS.WHITE,
                paddingLeft: SPACING.M,
                paddingRight: SPACING.M,
                paddingTop: "4px",
                paddingBottom: "4px",
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = COLORS.SOFT_CLOUD;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = COLORS.WHITE;
              }}
            >
              Chat Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerFeedback() {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.75fr",
          gap: SPACING.L,
        }}
      >
        <div>
          <SellerInfo seller={seller} />
          <h2
            style={{
              fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
              fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
              color: COLORS.MIDNIGHT_ASH,
            }}
          >
            Customer Reviews
          </h2>

          <div
            style={{
              marginTop: SPACING.M,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    aria-hidden="true"
                    style={{
                      height: "20px",
                      width: "20px",
                      color: reviews.average > rating ? "#FBBF24" : "#D1D5DB",
                    }}
                  />
                ))}
              </div>
            </div>
            <p
              style={{
                marginLeft: SPACING.S,
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              Based on {reviews.totalCount} reviews
            </p>
          </div>

          <div style={{ marginTop: SPACING.L }}>
            <dl style={{ display: "grid", gap: SPACING.M }}>
              {reviews.counts.map((count) => (
                <div
                  key={count.rating}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                  }}
                >
                  <dt
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        width: "12px",
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {count.rating}
                    </p>
                    <div
                      aria-hidden="true"
                      style={{
                        marginLeft: SPACING.S,
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                      }}
                    >
                      <StarIcon
                        aria-hidden="true"
                        style={{
                          height: "20px",
                          width: "20px",
                          color: count.count > 0 ? "#FBBF24" : "#D1D5DB",
                        }}
                      />

                      <div
                        style={{
                          marginLeft: SPACING.M,
                          flex: 1,
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            height: "12px",
                            borderRadius: "9999px",
                            border: `1px solid ${COLORS.MORNING_MIST}`,
                            backgroundColor: COLORS.SOFT_CLOUD,
                          }}
                        />
                        {count.count > 0 ? (
                          <div
                            style={{
                              width: `calc(${count.count} / ${reviews.totalCount} * 100%)`,
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              borderRadius: "9999px",
                              border: "1px solid #FBBF24",
                              backgroundColor: "#FBBF24",
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </dt>
                  <dd
                    style={{
                      marginLeft: SPACING.M,
                      width: "40px",
                      textAlign: "right",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {Math.round((count.count / reviews.totalCount) * 100)}%
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div style={{ marginTop: SPACING.XL }}>
            <h3
              style={{
                fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              Share your thoughts
            </h3>
            <p
              style={{
                marginTop: SPACING.S,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                color: COLORS.PEBBLE,
              }}
            >
              If you have used this product, share your thoughts with other
              customers
            </p>

            <a
              href="#"
              style={{
                marginTop: SPACING.L,
                display: "inline-flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: BORDER_RADIUS.MEDIUM,
                border: `1px solid ${COLORS.MORNING_MIST}`,
                backgroundColor: COLORS.WHITE,
                paddingLeft: SPACING.L,
                paddingRight: SPACING.L,
                paddingTop: SPACING.S,
                paddingBottom: SPACING.S,
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                textDecoration: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = COLORS.SOFT_CLOUD;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = COLORS.WHITE;
              }}
            >
              Write a review
            </a>
          </div>
        </div>

        <div style={{ marginTop: 0 }}>
          <div>
            <div
              style={{
                display: "grid",
                gap: SPACING.XL,
                margin: 0,
                padding: 0,
              }}
            >
              {reviews.featured.map((review) => (
                <div
                  key={review.id}
                  style={{
                    paddingTop: SPACING.XL,
                    paddingBottom: SPACING.XL,
                    borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      alt={`${review.author}`}
                      src={review.avatarSrc}
                      style={{
                        height: "48px",
                        width: "48px",
                        borderRadius: "50%",
                      }}
                    />
                    <div style={{ marginLeft: SPACING.M }}>
                      <h4
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                          color: COLORS.MIDNIGHT_ASH,
                        }}
                      >
                        {review.author}
                      </h4>
                      <div
                        style={{
                          marginTop: SPACING.S,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <StarIcon
                            key={rating}
                            aria-hidden="true"
                            style={{
                              height: "20px",
                              width: "20px",
                              color:
                                review.rating > rating ? "#FBBF24" : "#D1D5DB",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    dangerouslySetInnerHTML={{ __html: review.content }}
                    style={{
                      marginTop: SPACING.M,
                      display: "grid",
                      gap: SPACING.M,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                      fontStyle: "italic",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
