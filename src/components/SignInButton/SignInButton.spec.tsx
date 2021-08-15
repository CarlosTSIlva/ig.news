import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { useSession } from "next-auth/client";
import { SignInButton } from ".";

jest.mock("next-auth/client");

describe("SignInButton component", () => {
  it("renders correctly when user is not authenticated", () => {
    const useSessionMocker = mocked(useSession);
    useSessionMocker.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    expect(screen.getByText("Sing in with GitHub")).toBeInTheDocument();
  });

  it("renders correctly when user is authenticated", () => {
    const useSessionMocker = mocked(useSession);
    useSessionMocker.mockReturnValueOnce([
      {
        user: { email: "teste@hotmail.com", image: "", name: "John Doe" },
        expires: "fale-expires",
      },
      false,
    ]);

    render(<SignInButton />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
