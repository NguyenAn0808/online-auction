import { Link } from "react-router-dom";
import ListingForm from "../components/ListingForm";

const ListingPage = () => {
  return (
    <>
      <header className="text-black p-4 w-full border-b border-black-300">
        <div className="container max-w-7xl mx-auto items-center">
          <div className="flex justify-center">
            <Link to="/" className="text-2xl font-bold px-4">
              eBid
            </Link>
          </div>
        </div>
      </header>
      <ListingForm />
    </>
  );
};

export default ListingPage;
