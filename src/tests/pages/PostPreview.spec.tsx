import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";

import { useSession } from "next-auth/client";
import { useRouter } from "next/router";

const posts = {
  slug: "my-new-post",
  title: "my new post",
  content: "<p>Post excerpt</p>",
  updatedAt: "10 de Abril",
};

jest.mock("next-auth/client");
jest.mock("next/router");
jest.mock("../../services/prismic");

describe("Post preview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Post posts={posts} />);
    expect(screen.getByText("my new post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects user to full post when user is subscribed", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMocked = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: "fake-active-subscription" },
      false,
    ] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    render(<Post posts={posts} />);

    expect(pushMocked).toHaveBeenCalledWith("/posts/my-new-post");
  });

  it("loads initial data", async () => {
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

    const response = await getStaticProps({ params: { slug: "my-new-post" } });

    expect(response).toEqual({
      props: {
        posts: {
          content: "<p>Post excerpt</p>",
          slug: "my-new-post",
          title: "My new post",
          updatedAt: "01 de abril de 2021",
        },
      },
      redirect: 1800,
    });
  });
});
