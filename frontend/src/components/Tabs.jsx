import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isMessages = pathname.startsWith("/conversations");
  const userId = localStorage.getItem("userId") || "buyer-1";

  function goDetails() {
    // Navigate to profile summary as the default details view
    navigate(`/summary/${userId}`);
  }

  function goMessages() {
    navigate(`/conversations`);
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={isMessages ? "Messages" : "Details"}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          onChange={(e) =>
            e.target.value === "Messages" ? goMessages() : goDetails()
          }
        >
          <option>Details</option>
          <option>Messages</option>
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
        />
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8">
            <button
              onClick={goDetails}
              aria-current={!isMessages ? "page" : undefined}
              className={classNames(
                !isMessages
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700",
                "flex border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap bg-transparent"
              )}
            >
              Details
            </button>

            <button
              onClick={goMessages}
              aria-current={isMessages ? "page" : undefined}
              className={classNames(
                isMessages
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700",
                "flex border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap bg-transparent"
              )}
            >
              Messages
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
