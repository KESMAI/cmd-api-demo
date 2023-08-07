import Layout from "../components/Layout/index";
import { useEffect } from "react";
import { useStore } from "../store/zustand";
import { checkUser } from "../util/checkUser";
import axios from "axios";

import "../styles/reset.css";
import "../styles/common.css";

const MyApp = ({ Component, pageProps }) => {
  const isUser = useStore(state => state.isUser);
  const setIsUser = useStore(state => state.setIsUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserNickName = useStore(state => state.setUserNickName);
  const setUserBalance = useStore(state => state.setUserBalance);

  const user_info = async () => {
    let checkUser_id = await checkUser(
      localStorage.getItem("cmd-user"),
      localStorage.getItem("cmd-user-refresh"),
      setIsUser
    ); //504에러
    if (checkUser_id == null || checkUser == "undefined") return;
    await axios
      .post("/user_info", { user_id: checkUser_id })
      .then(res => {
        setUserId(res.data.user_id);
        setUserNickName(res.data.user_name);
        setUserBalance(res.data.user_balance);
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    user_info();
  }, [isUser]);
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
};
export default MyApp;
