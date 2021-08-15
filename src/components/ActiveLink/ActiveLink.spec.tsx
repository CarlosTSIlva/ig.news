import { render, screen } from "@testing-library/react";
import { ActiveLink } from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  it("renders correctly", () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>home</a>
      </ActiveLink>
    );

    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("adds active class if the link as currently link", () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>home</a>
      </ActiveLink>
    );

    expect(screen.getByText("home")).toHaveClass("active");
  });
});
