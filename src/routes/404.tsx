import Feedback from "../components/Feedback";
import Layout from "../components/Layout";
import useLiff from "../contexts/liff";
import useTitle from "../utils/hooks";

const FourOhFour = () => {
  const { liff } = useLiff();
  useTitle("404");
  return (
    <>
      <Layout>
        <Feedback
          header="Error 404"
          message="This page could not be found."
          type="Error"
          button="Close"
          liff={liff}
        />
      </Layout>
    </>
  );
};

export default FourOhFour;
