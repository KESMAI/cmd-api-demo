import axios from "axios";

/* 관리자계정인지 확인하기 */
export const checkUser = async (token, refresh_token, setIsUser) => {
  try {
    const response = await axios.post("/user_check", {
      access: token,
      refresh: refresh_token,
    });
    console.log(response.data.msg);
    if (response.data.msg == "토큰재발급") {
      localStorage.setItem("cmd-user", response.data.access_token);
    } else if (response.data.msg == "토큰") {
      setIsUser(response.data.result);
    } else if (response.data.msg == "토큰삭제") {
      localStorage.removeItem("cmd-user");
      localStorage.removeItem("cmd-user-refresh");
      window.location.reload(true);
    }
    return response.data.id;
  } catch (err) {
    setIsUser(false);
  }
};
