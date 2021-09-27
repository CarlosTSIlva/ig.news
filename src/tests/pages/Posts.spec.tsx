import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Posts, { getServerSideProps } from "../../pages/posts/[slug]";
import { getSession } from "next-auth/client";
import { getPrismicClient } from "../../services/prismic";
const posts = {
  slug: "my-ne-post",
  title: "my new post",
  content: "<p>Post excerpt</p>",
  updatedAt: "10 de Abril",
};

jest.mock("next-auth/client");
jest.mock("../../services/prismic");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);
    expect(screen.getByText("my new post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it("redirects user if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession);
    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: {
        slug: "my-ne-post",
      },
    } as any);
    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicCLientMocked = mocked(getPrismicClient);

    getPrismicCLientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My new post" }],
          content: [{ type: "paragraph", text: "Post excerpt" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: "my-new-post",
      },
    } as any);

    expect(response).toEqual({
      props: {
        posts: {
          content: "<p>Post excerpt</p>",
          slug: "my-new-post",
          title: "My new post",
          updatedAt: "01 de abril de 2021",
        },
      },
    });
  });
});
