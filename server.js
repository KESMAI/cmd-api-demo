const next = require("next");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 9090;
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const jwt = require("jsonwebtoken");

dotenv.config();

const { sequelize, User } = require("./model/index.js");
const { resolve } = require("path");
sequelize
  // sync : MySQL에 테이블이 존재 하지 않을때 생성
  //      force: true   => 이미 테이블이 있으면 drop하고 다시 테이블 생성
  .sync({ force: false })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch(err => {
    console.error(err);
  });
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();
app.prepare().then(() => {
  server.use(cors());
  server.use(express.json({ limit: "50mb" }));
  server.use(
    express.urlencoded({
      limit: "50mb",
      extended: false,
      parameterLimit: 1000000,
    })
  );
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  server.post("/sign_up", async (req, res) => {
    const { user_name, user_id, user_pw } = req.body;

    const create_user = await axios.post(
      "https://game-api.cmd-test.com/user/create",
      {
        id: user_id,
        name: user_name,
        balance: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Ag-Code": "apiTeam1-f7749a9",
          "Ag-Token": "9715afb6-9b55-4cc8-9a5c-8fc341dd07f4",
        },
      }
    );
    if (create_user.status != 200) {
      res.send({ result: false });
    } else if (create_user.data.status == 0) {
      res.send({ result: false });
    }
    await User.create({
      user_name: user_name,
      user_id: user_id,
      user_pw: user_pw,
    })
      .then(resolve => {
        res.send({ result: true });
      })
      .catch(err => {
        res.send({ result: false });
      });
  });
  const verifyToken = token => {
    try {
      return jwt.verify(token, process.env.JWT_USER);
    } catch (e) {
      if (e.name == "TokenExpiredError") {
        console.log("시간만료");
        return "시간만료";
      }
    }
  };
  server.post("/logout", async (req, res) => {
    const user_id = req.body.user_id;
    await User.update({ token: "" }, { where: { user_id: user_id } })
      .then(resolve => {
        res.send({ result: true });
      })
      .catch(err => {
        console.log(err);
      });
  });
  server.post("/user_check", async (req, res) => {
    const { access, refresh } = req.body;

    const access_token = verifyToken(access);

    const refresh_token = verifyToken(refresh);

    const token_user_id = await User.findOne({
      where: { token: refresh },
    }).catch(err => {
      console.log(err);
    });
    //리프레시 토큰이 시간만료면 로그아웃 처리
    if (refresh_token == "시간만료" || refresh_token == undefined) {
      if (refresh_token == "시간만료") {
        console.log("시간만료");
        await User.update({ token: "" }, { where: { token: refresh } })
          .then(resolve => {
            res.send({ msg: "토큰삭제" });
          })
          .catch(err => {
            console.log(err);
          });
      } else if (refresh_token == undefined) {
        res.send({ msg: "토큰미발급" });
      }
    } else if (refresh_token != "시간만료") {
      console.log("refresh_token이있음");
      if (access_token == "시간만료" || access_token == undefined) {
        const access_token = jwt.sign(
          { user_id: token_user_id.user_id },
          process.env.JWT_USER,
          {
            algorithm: "HS256", // 해싱 알고리즘
            expiresIn: "30m", // 토큰 유효 기간
            issuer: "issuer", // 발행자
          }
        );
        res.send({ msg: "토큰재발급", access_token: access_token });
      } else {
        res.send({ msg: "토큰", result: true, id: access_token.user_id });
      }
    }
  });
  server.post("/user_info", async (req, res) => {
    const user_id = req.body.user_id;
    await User.findOne({
      where: { user_id: user_id },
    })
      .then(resolve => {
        res.send(resolve);
      })
      .catch(err => {
        console.log(err);
      });
  });

  server.post("/add_balance", async (req, res) => {
    const { user_id } = req.body;

    await User.increment(
      { user_balance: 10000 },
      {
        where: {
          user_id: user_id,
        },
      }
    )
      .then(resolve => {
        res.send({ result: true });
      })
      .catch(err => {
        res.send({ result: false });
      });
  });
  server.post("/sub_balance", async (req, res) => {
    const { user_id } = req.body;

    await User.increment(
      { user_balance: -10000 },
      {
        where: {
          user_id: user_id,
        },
      }
    )
      .then(resolve => {
        res.send({ result: true });
      })
      .catch(err => {
        res.send({ result: false });
      });
  });
  server.post("/get_url", async (req, res) => {
    const { user_id } = req.body;
    const user = await User.findOne({
      where: {
        user_id: user_id,
      },
    });
    const game_user = await axios.post(
      "https://game-api.cmd-test.com/user/info",
      { user_id: user_id },
      {
        headers: {
          "Content-Type": "application/json",
          "Ag-Code": "apiTeam1-f7749a9",
          "Ag-Token": "9715afb6-9b55-4cc8-9a5c-8fc341dd07f4",
        },
      }
    );
    console.log(user.user_balance);

    console.log(game_user.data.balance);

    if (user.user_balance > game_user.data.balance) {
      await axios
        .post(
          "https://game-api.cmd-test.com/user/add_balance",
          {
            user_id: user_id,
            amount: user.user_balance - game_user.data.balance,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Ag-Code": "apiTeam1-f7749a9",
              "Ag-Token": "9715afb6-9b55-4cc8-9a5c-8fc341dd07f4",
            },
          }
        )
        .then(resolve => {
          console.log("증가");
        });
    } else if (user.user_balance < game_user.data.balance) {
      await axios
        .post(
          "https://game-api.cmd-test.com/user/sub_balance",
          {
            user_id: user_id,
            amount: game_user.data.balance - user.user_balance,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Ag-Code": "apiTeam1-f7749a9",
              "Ag-Token": "9715afb6-9b55-4cc8-9a5c-8fc341dd07f4",
            },
          }
        )
        .then(resolve => {
          console.log("빼기");
        });
    }
    await axios
      .post(
        "https://game-api.cmd-test.com/game/get_url",
        { user_id: user_id },
        {
          headers: {
            "Content-Type": "application/json",
            "Ag-Code": "apiTeam1-f7749a9",
            "Ag-Token": "9715afb6-9b55-4cc8-9a5c-8fc341dd07f4",
          },
        }
      )
      .then(resolve => {
        res.send({ result: true, url: resolve.data.launch_url });
      });
  });
  server.post("/login", async (req, res) => {
    const { user_id, user_pw } = req.body;
    await User.findOne({
      where: {
        user_id: user_id,
      },
    })
      .then(data => {
        console.log(data);
        if (data.user_pw !== user_pw) {
          res.send({
            result: false,
            msg: "비밀번호가 틀렸습니다.",
          });
        } else {
          const refresh_token = jwt.sign(
            { user_id: user_id },
            process.env.JWT_USER,
            {
              algorithm: "HS256", // 해싱 알고리즘
              expiresIn: "1d", // 토큰 유효 기간
              issuer: "issuer", // 발행자
            }
          );
          User.update({ token: refresh_token }, { where: { user_id: user_id } })
            .then(res => {
              return refresh_token;
            })
            .catch(err => {
              console.log(err);
            });

          const access_token = jwt.sign(
            { user_id: user_id },
            process.env.JWT_USER,
            {
              algorithm: "HS256", // 해싱 알고리즘
              expiresIn: "30m", // 토큰 유효 기간
              issuer: "issuer", // 발행자
            }
          );

          res.send({
            result: true,
            access_token: access_token,
            refresh_token: refresh_token,
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.send({ result: false, msg: "아이디가 없습니다." });
      });
  });
  server.all("*", (req, res) => {
    return handle(req, res);
  });
  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
