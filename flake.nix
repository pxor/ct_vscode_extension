{
  description = "Dev environment for ct_vscode VS Code extension";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;  # Needed for vscode
        };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_18
            yarn
            nodePackages.typescript
            nodePackages.eslint
          ];

          shellHook = ''
            echo "VS Code Extension Dev Shell Ready 🚀"
          '';
        };
      });
}