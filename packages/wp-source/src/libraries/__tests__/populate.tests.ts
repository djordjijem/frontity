import { createStore, InitializedStore } from "@frontity/connect";
import { Response as NodeResponse } from "node-fetch";
import clone from "clone-deep";
import wpSource from "../../";
import WpSource from "../../../types";
import populate from "../populate";
import postsCat7 from "../handlers/__tests__/mocks/posts-cat-7.json";
import postsCat7Subdir from "../handlers/__tests__/mocks/posts-cat-7-subdir.json";
import movies from "../handlers/__tests__/mocks/movies.json";

jest.mock("../");

const initStore = (): InitializedStore<WpSource> => {
  const config = wpSource();
  config.state = clone(config.state);
  return createStore(config);
};

// Use Response from "node-fetch" to mock response objects,
// but with "lib.dom.d.ts" Response type.
const mockResponse = (body): Response =>
  (new NodeResponse(JSON.stringify(body)) as object) as Response;

describe("populate", () => {
  test("adds posts and embedded into state", async () => {
    const { state } = initStore();
    const response = mockResponse(postsCat7);
    const result = await populate({ state, response });

    expect(result).toMatchSnapshot();
    expect(state.source).toMatchSnapshot();
  });

  test("removes WP API path from links", async () => {
    const { state } = initStore();
    state.source.api = "https://test.frontity.io/subdirectory/wp-json";

    const response = mockResponse(postsCat7Subdir);
    const result = await populate({ state, response });

    expect(result).toMatchSnapshot();
    expect(state.source).toMatchSnapshot();
  });

  test("transforms links if subdirectory is specified", async () => {
    const { state } = initStore();
    state.source.api = "https://test.frontity.io/subdirectory/wp-json";

    const response = mockResponse(postsCat7Subdir);
    const subdirectory = "/blog/";
    const result = await populate({ state, response, subdirectory });

    expect(result).toMatchSnapshot();
    expect(state.source).toMatchSnapshot();
  });

  test("add new custom post types & taxonomies to the state", async () => {
    const { state } = initStore();
    const response = mockResponse(movies);
    const result = await populate({ state, response });

    expect(result).toMatchSnapshot();
    expect(state.source).toMatchSnapshot();
  });
});
