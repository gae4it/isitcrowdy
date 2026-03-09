/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
	skipWaiting: true,
});

/** @type {import("next").NextConfig} */
const config = {};

export default withPWA(config);
