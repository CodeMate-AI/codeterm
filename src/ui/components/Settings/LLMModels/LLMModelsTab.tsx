import React, { useCallback, useEffect, useState } from "react";
import modelData from "../../../models/models.json";
import { Socket } from "socket.io-client";
import { LLMCurrentModel, LLMModel } from "../../../types/models";
import CurrentModelDetails from "./CurrentModelDetails";
import { User } from "../../../types/user";

const providerParams: { [key: string]: string[] } = {
  openai: ["apiKey"],
  openaiAzure: ["deployment_name", "apiKey", "endpoint", "api_version"],
  google: ["apiKey"],
  anthropic: ["apiKey"],
};

interface LLMModelProps {
  socket: Socket | null;
  isConnected: boolean;
}



interface ToggleProps {
  label?: string
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  socket: Socket | null;
  isConnected: boolean;
}

export function Toggle({
  label,
  defaultChecked = false,
  onChange,
  className = "",
  socket, isConnected
}: ToggleProps) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  useEffect(() => {
    if (socket && isConnected) {
      // Emit event to check if Codemate model is selected
      socket.emit("checkCodemateModelStatus");

      // Listen for the response from the server
      socket.on("codemateModelStatus", (response) => {
        if (response && response.selected !== undefined) {
          setIsChecked(response.selected);
        } else {
          setIsChecked(false); // Fallback value
        }
      });

      // Cleanup the event listener on unmount
      return () => {
        socket.off("codemateModelStatus");
      };
    } else {
      console.log("Socket not connected, cannot emit event");
    }
  }, [socket, isConnected]);



  useEffect(() => {
    const selected = localStorage.getItem("selected");

    // If 'selected' exists in localStorage, parse it as a boolean
    setIsChecked(selected === "true"); // This will convert "true" to true, "false" to false, and null to false
  }, []); // Empty dependency array ensures this runs on mount



  const handleToggle = () => {
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange?.(newValue)

    if (socket && isConnected) {
      socket.emit("updateCodemateModel", { selected: newValue });
      // setIsChecked(newValue)
    }

    localStorage.setItem("selected", JSON.stringify(newValue));
    // setIsChecked()

  }


  return (
    <div className={`flex items-center justify-between ${className} mb-4`} >
      {label && (
        <span className="text-sm text-[--primaryTextColor] mr-2">{label}</span>
      )}
      <button
        role="switch"
        aria-checked={isChecked}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none
          focus-visible:ring-2 focus-visible:ring-[--primaryTextColor] focus-visible:ring-opacity-75
          ${isChecked ? 'bg-[--darkBlueColor]' : 'bg-[--lightGrayColor]'}
        `}
      >
        <span className="sr-only">
          {label || "Toggle"}
        </span>
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full
            bg-[--primaryTextColor] transition duration-200 ease-in-out
            ${isChecked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}



export default function LLMModelTab({ socket, isConnected }: LLMModelProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const [user, setUser] = useState<User | null>(null);
  const [models, setModels] = useState<LLMModel[]>(modelData.models);
  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [currentModel, setCurrentModel] = useState<LLMCurrentModel | null>(
    null
  );

  const [isSelected, setIsSelected] = useState<boolean>(false);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const uniqueProviders = Array.from(
      new Set(models.map((model) => model.provider))
    );
    setProviders(uniqueProviders);

    if (socket && isConnected) {
      socket.emit("get_current_model");

      const handleCurrentModel = (currentModel: any) => {
        if (currentModel) {
          setCurrentModel(currentModel);
        } else {
          setCurrentModel(null);
        }
      };

      socket.on("currentModelRetrieved", handleCurrentModel);

      return () => {
        socket.off("currentModelRetrieved", handleCurrentModel);
      };
    }
  }, [socket, isConnected, models]);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('session_token'));
  }, []);


  useEffect(() => {
    const storedValue = localStorage.getItem("selected");
    if (storedValue) {
      setIsSelected(storedValue === 'true');
    }
  }, []);

  const handleProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const provider = e.target.value;
      setSelectedProvider(provider);
      setSelectedModel(null);
      setParams({});
    },
    []
  );

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const modelId = e.target.value;
      const model = models.find((m) => m.id === modelId);
      setSelectedModel(model || null);

      if (model) {
        const provider = model.providerId || "";
        const newParams: { [key: string]: string } = {};
        providerParams[provider]?.forEach((param) => {
          newParams[param] = "";
        });
        setParams(newParams);

        if (socket && isConnected) {
          socket.emit("get_model_details", { modelId });
        }
      } else {
        setParams({});
      }
    },
    [socket, isConnected, models]
  );

  useEffect(() => {
    if (socket && isConnected && selectedModel) {
      const handleModelDetails = (modelDetails: any) => {
        if (modelDetails && modelDetails.params) {
          setParams(modelDetails.params);
        } else {
          const provider = selectedModel.providerId || "";
          const newParams: { [key: string]: string } = {};
          providerParams[provider]?.forEach((param) => {
            newParams[param] = "";
          });
          setParams(newParams);
        }
      };

      const handleError = (error: any) => {
        const provider = selectedModel.providerId || "";
        const newParams: { [key: string]: string } = {};
        providerParams[provider]?.forEach((param) => {
          newParams[param] = "";
        });
        setParams(newParams);
      };

      socket.on("modelDetailsRetrieved", handleModelDetails);
      socket.on("error", handleError);

      return () => {
        socket.off("modelDetailsRetrieved", handleModelDetails);
        socket.off("error", handleError);
      };
    }
  }, [socket, isConnected, selectedModel]);

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && isConnected && selectedModel) {
      setIsLoading(true);
      setSuccessMessage("");
      const modelDetails = {
        model: selectedModel,
        params: params,
      };

      socket.emit("saveModelDetails", modelDetails);
    }
  };

  useEffect(() => {
    if (socket && isConnected) {
      const handleModelDetailsSaved = (response: { message: string }) => {
        setIsLoading(false);
        setSuccessMessage(response.message);

        // Set a timeout to clear the success message after 3 seconds
        const timer = setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

        // Clear the timeout if the component unmounts
        return () => clearTimeout(timer);
      };

      const handleError = (error: any) => {
        setIsLoading(false);
        setSuccessMessage("An error occurred while saving model details.");

        // Set a timeout to clear the error message after 3 seconds
        const timer = setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

        // Clear the timeout if the component unmounts
        return () => clearTimeout(timer);
      };

      socket.on("modelDetailsSaved", handleModelDetailsSaved);
      socket.on("error", handleError);

      return () => {
        socket.off("modelDetailsSaved", handleModelDetailsSaved);
        socket.off("error", handleError);
      };
    }
  }, [socket, isConnected]);

  const filteredModels =
    user?.planType === "pro"
      ? [
        ...models.filter((model) => model.provider === selectedProvider),
        {
          id: "codemate.ai-model",
          provider: "CodeMate.ai",
          providerId: "codemate",
          name: "CodeMate.ai Model",
          multiModal: true,
        },
      ]
      : models.filter((model) => model.provider === selectedProvider);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === ".") {
        setSelectedProvider("");
        setSelectedModel(null);
        setParams({});
        setSuccessMessage("");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);



  const updateIsSelected = (newValue) => {
    setIsSelected(newValue);
  };


const renderCurrentModelDetails = () => {
  if (isLoading) {
    return <p>Loading current model...</p>;  // Show loading state until model is set
  }

  if (currentModel) {
    // Render the model details when it is set
    if (isSelected) {
      return (
        <div className="w-full bg-[--bgColor] border border-[--borderColor] rounded-lg p-4 mt-4">
          <div className="space-y-4">
            <p className="text-xl text-center text-[--secondaryTextColor]">
              Using CodeMate.ai for Advanced Code Assistance
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <CurrentModelDetails
          provider={currentModel.id.provider}
          name={currentModel.id.name}
          params={currentModel.params}
        />
      );
    }
  }

  return <p>No current model selected.</p>;  // Render a fallback message if model is null
};


  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      <h1 className="text-2xl font-semibold mb-6">LLM Models</h1>

      {
        isAuthenticated && (
          <Toggle
            label="Activate CodeMate.ai for Advanced Code Assistance"
            defaultChecked={true}
            onChange={updateIsSelected}
            socket={socket}
            isConnected={isConnected}
          />
        )
      }

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="provider"
            className="block custom-font-size font-medium text-[--textColor]"
          >
            Select Provider
          </label>
          <div className="relative">
            <select
              id="provider"
              value={selectedProvider}
              onChange={handleProviderChange}
              className="block w-full bg-[--bgGradientEnd] border-[--borderColor] rounded-md py-2 pl-3 pr-10 text-[--textColor] focus:outline-none focus:ring-1 focus:ring-[--blueColor] focus:border-[--blueColor] sm:custom-font-size appearance-none hide-scrollbar max-h-[100px] overflow-auto"
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
        </div>
        {selectedProvider && (
          <div>
            <label
              htmlFor="model"
              className="block custom-font-size font-medium text-[--textColor]"
            >
              Select Model
            </label>
            <div className="relative">
              <select
                id="model"
                value={selectedModel ? selectedModel.id : ""}
                onChange={handleModelChange}
                className="block w-full bg-[--bgColor] border-[--borderColor] rounded-md py-2 pl-3 pr-10 text-[--textColor] focus:outline-none focus:ring-1 focus:ring-[--blueColor] focus:border-[--blueColor] sm:custom-font-size appearance-none hide-scrollbar max-h-[100px] overflow-auto"
              >
                <option value="">Select a model</option>
                {filteredModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {selectedModel && Object.keys(params).length > 0 && (
          <div className="space-y-2">
            {Object.entries(params).map(([key, value]) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block custom-font-size font-medium text-[--textColor]"
                >
                  {key}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleParamChange}
                  className="block w-full bg-[--bgColor] border-[--borderColor] rounded-md py-2 pl-3 pr-10 text-[--textColor] focus:outline-none focus:ring-1 focus:ring-[--blueColor] focus:border-[--blueColor] sm:custom-font-size appearance-none hide-scrollbar max-h-[100px] overflow-auto"
                />
              </div>
            ))}
          </div>
        )}


        <button
          type="submit"
          disabled={
            !selectedModel || Object.values(params).some((v) => !v) || isLoading
          }
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm custom-font-size font-medium  bg-[--darkBlueColorGradientStart] hover:bg-[--darkBlueColorGradientStart] bg-gradient-to-l from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--textColor] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--darkBlueColorGradientStart] disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Select"}
        </button>
      </form>


      {renderCurrentModelDetails()}

      {successMessage && (
        <div className="mt-4 text-green-500 text-center">{successMessage}</div>
      )}
      <div className="mt-4 custom-font-size text-[--grayColor] text-center">
        Press Ctrl + . to close the model selection
      </div>
    </div>
  );
}
