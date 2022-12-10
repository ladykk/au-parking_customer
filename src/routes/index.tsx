import Landing from "../components/Landing";
import useTitle from "../utils/hooks";

const Home = () => {
  useTitle("Home");
  return (
    <>
      <Landing isLoading={false} />
    </>
  );
};

export default Home;
