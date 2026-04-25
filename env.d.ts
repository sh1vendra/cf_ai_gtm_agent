/* eslint-disable */
declare namespace Cloudflare {
	interface GlobalProps {
		mainModule: typeof import("./src/server");
		durableNamespaces: "GTMAgent";
	}
	interface Env {
		AI: Ai;
		GTM_AGENT: DurableObjectNamespace<import("./src/server").GTMAgent>;
		ASSETS: Fetcher;
	}
}
interface Env extends Cloudflare.Env {}
