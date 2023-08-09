import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useStore } from "../store/zustand";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [signup_user_name, setSignUpUserName] = useState("");
  const [signup_user_id, setSignUpUserId] = useState("");
  const [signup_user_pw, setSignUpUserPw] = useState("");
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [url, setUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const isUser = useStore(state => state.isUser);
  const userId = useStore(state => state.userId);
  const user_balance = useStore(state => state.user_balance);

  const user_nick_name = useStore(state => state.user_nick_name);

  const [login_user_id, setLoginUserId] = useState("");
  const [login_user_pw, setLoginUserPw] = useState("");
  const handleOpen = () => setOpen(true);
  const handleOpen2 = () => setOpen2(true);
  const handleOpen3 = () => setOpen3(true);

  const handleClose = () => setOpen(false);
  const handleClose2 = () => setOpen2(false);
  const handleClose3 = () => setOpen3(false);
  const user_balance_add = async () => {
    await axios
      .post("/add_balance", {
        user_id: userId,
      })
      .then(res => {
        if (res.data.result == true) {
          window.location.reload(true);
        }
      });
  };
  const user_balance_sub = async () => {
    await axios
      .post("/sub_balance", {
        user_id: userId,
      })
      .then(res => {
        if (res.data.result == true) {
          window.location.reload(true);
        }
      });
  };
  const sign_up = async () => {
    if (signup_user_name == "") {
      alert("Please enter your username");
      return;
    }
    if (signup_user_id == "") {
      alert("Please enter your user ID");
      return;
    }
    if (signup_user_pw == "") {
      alert("Please enter a password");
      return;
    }

    await axios
      .post("/sign_up", {
        user_name: signup_user_name,
        user_id: signup_user_id,
        user_pw: signup_user_pw,
      })
      .then(res => {
        window.location.reload(true);
      });
  };

  const get_game_url = async () => {
    await axios.post("/get_url", { user_id: userId }).then(res => {
      setUrl(res.data.url);
    });
  };
  const login = async () => {
    await axios
      .post("/login", {
        user_id: login_user_id,
        user_pw: login_user_pw,
      })
      .then(res => {
        if (res.data.result == true) {
          const access_token = res.data.access_token;
          const refresh_token = res.data.refresh_token;
          localStorage.setItem("cmd-user", access_token);
          localStorage.setItem("cmd-user-refresh", refresh_token);
          window.location.assign("/");
        } else if (
          res.data.result == false &&
          res.data.msg == "ERROR_PASSWORD"
        ) {
          alert("Incorrect password");
          return;
        } else if (res.data.result == false && res.data.msg == "ERROR_ID") {
          alert("Incorrect ID");
          return;
        }
      })
      .catch(err => {
        alert("error");
      });
  };
  const logout = async () => {
    await axios
      .post("/logout", {
        user_id: userId,
      })
      .then(res => {
        if (res.data.result == true) {
          localStorage.removeItem("cmd-user");
          localStorage.removeItem("cmd-user-refresh");
          window.location.reload(true);
        }
      })
      .catch(err => console.log(err));
  };
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    mounted && (
      <div className="contentsWrap">
        <section>
          <header>
            <h1>
              <img src="../img/logo.png" />
            </h1>
            {isUser ? (
              <ul className="memInfo">
                <li>
                  <dl>
                    <dt>
                      <FontAwesomeIcon icon={faCrown} />
                      {user_nick_name}
                    </dt>
                    <dd>${user_balance}</dd>
                  </dl>
                </li>
                <li>
                  <button
                    onClick={e => {
                      user_balance_add();
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  <button
                    onClick={e => {
                      user_balance_sub();
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                </li>
                <li>
                  <a
                    onClick={e => {
                      logout();
                    }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            ) : (
              <ul className="topBtn">
                <li>
                  <a
                    onClick={e => {
                      handleOpen2();
                    }}
                  >
                    Sign up
                  </a>
                </li>
                <li>
                  <a onClick={handleOpen}>Login</a>
                </li>
              </ul>
            )}
          </header>
          <h2>
            <span>EXPLORE OF GAMES AT LIVE CASINO</span>
            <p>CMD LIVE</p>
          </h2>
          <button
            onClick={e => {
              handleOpen3();
              get_game_url();
            }}
          ></button>
          <footer>© 2023 CMD Gaming. All Rights Reserved.</footer>
        </section>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Member Login
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div className="inputBox">
                <TextField
                  id="outlined-basic"
                  label="USERID"
                  variant="outlined"
                  onChange={e => setLoginUserId(e.target.value)}
                />
                <TextField
                  id="outlined-basic"
                  label="PASSWORD"
                  variant="outlined"
                  onChange={e => setLoginUserPw(e.target.value)}
                />
              </div>
              <div className="modelBtn">
                <button
                  onClick={e => {
                    handleClose();
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={e => {
                    login();
                  }}
                >
                  Login
                </button>
              </div>
            </Typography>
          </Box>
        </Modal>
        <Modal
          open={open2}
          onClose={handleClose2}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Member SignUp
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div className="inputBox">
                <TextField
                  id="outlined-basic"
                  label="USERNAME"
                  variant="outlined"
                  onChange={e => {
                    setSignUpUserName(e.target.value);
                  }}
                />
                <TextField
                  id="outlined-basic"
                  label="USERID"
                  variant="outlined"
                  onChange={e => {
                    setSignUpUserId(e.target.value);
                  }}
                />
                <TextField
                  id="outlined-basic"
                  label="PASSWORD"
                  variant="outlined"
                  onChange={e => {
                    setSignUpUserPw(e.target.value);
                  }}
                />
              </div>
              <div className="modelBtn">
                <button
                  onClick={e => {
                    handleClose2();
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={e => {
                    sign_up();
                  }}
                >
                  SignUp
                </button>
              </div>
            </Typography>
          </Box>
        </Modal>
        <Modal
          open={open3}
          onClose={handleClose3}
          style={{ width: "500px" }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div style={{ position: "relative" }}>
            {" "}
            <iframe
              src={url}
              style={{ width: "100vw", height: "100vh" }}
            ></iframe>
            <Button
              variant="contained"
              style={{ position: "absolute", top: "0px", left: "0px" }}
              onClick={e => {
                window.location.reload(true);
              }}
            >
              Back
            </Button>
          </div>
        </Modal>
      </div>
    )
  );
}
