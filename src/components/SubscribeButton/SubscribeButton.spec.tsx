import { fireEvent, render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { signIn, useSession } from "next-auth/client";
import { SubscribeButton } from ".";
import { useRouter } from "next/router";

jest.mock("next-auth/client");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  it("redirects user to sign in when not authenticated", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    const signInMocked = mocked(signIn);
    render(<SubscribeButton />);
    const subscribeButtons = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButtons);
    expect(signInMocked).toHaveBeenCalled();
  });

  it("redirects to posts when user already has a subscription", () => {
    const useRouterMocker = mocked(useRouter);
    const useSessionMocked = mocked(useSession);
    const pushMocked = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        user: { email: "teste@hotmail.com", image: "", name: "John Doe" },
        expires: "fale-expires",
        activeSubscription: "fake-active-subscription",
      },
      false,
    ]);

    useRouterMocker.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    expect(pushMocked).toHaveBeenCalledWith("/posts");
  });
});
