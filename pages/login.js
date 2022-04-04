import { useEffect, useState } from "react";
import cls from "classnames";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Loading from "../components/loading"
import { magic } from "../lib/magic-client";
import styles from "../styles/Login.module.css";
import Link from "next/link";
import netflixLogo from "../public/static/netflix.svg"
var validator = require("email-validator");

const Login = () => {
  const [email, setEmail] = useState("");
  const [isValid, SetIsValid] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleComplete = () => {
      setIsLoading(false);
    };
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const handleOnChangeEmail = (e) => {
    const email = e.target.value;
    validateEmail(email);
    setEmail(email);
    setUserMsg("");
  };

  function validateEmail(email) {
   const valid = validator.validate(email);
    console.log({valid})
    if (validator) {
      SetIsValid(true);
    } else {
      SetIsValid(false);
    }
  }

  const handleLoginWithEmail = async (e) => {
    e.preventDefault();

     if (email && isValid) {
       // log in a user by their email
       try {
         setIsLoading(true);

         const didToken = await magic.auth.loginWithMagicLink({
           email,
         });
         if (didToken) {
           const response = await fetch("/api/login", {
             method: "POST",
             headers: {
               Authorization: `Bearer ${didToken}`,
               "Content-Type": "application/json",
             },
           });

           const loggedInResponse = await response.json();
           if (loggedInResponse.done) {
             router.push("/");
           } else {
             setIsLoading(false);
             setUserMsg("Something went wrong logging in");
           }
         }
       } catch (error) {
         // Handle errors if required!
         console.error("Something went wrong logging in", error);
         setIsLoading(false);
       }
     } else {
       // show user message
       setIsLoading(false);
       setUserMsg("Enter a valid email address");
     }
  };
  return (
    <div className={styles.container}>
      <Head>
        <title> Netflix SignIn</title>
      </Head>

      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <Link href="/">
            <a className={styles.logoLink}>
              <div className={styles.logoWrapper}>
                <Image
                  src={netflixLogo}
                  width="128px"
                  height="34px"
                  alt="netflix logo"
                />
              </div>
            </a>
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.mainWrapper}>
          <h1 className={styles.signInHeader}> Sign In</h1>
          <input
            onChange={handleOnChangeEmail}
            label="Email Address"
            name="Email Address"
            value={email}
            className={styles.emailInput}
            type="text"
            placeholder="Email address"
          />
          <p className={styles.userMsg}> {userMsg}</p>
          {isLoading ? (
            <Loading />
          ) : (
            <button
              onClick={handleLoginWithEmail}
              className={cls(styles.loginBtn, !email && styles.disabled)}
              disabled={!email}
            >
              Sign In
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
