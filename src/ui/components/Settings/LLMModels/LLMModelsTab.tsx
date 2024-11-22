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

export default function LLMModelTab({ socket, isConnected }: LLMModelProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const [user, setUser] = useState<User | null>(null);
  const [models, setModels] = useState<LLMModel[]>(modelData.models);
  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [currentModel, setCurrentModel] = useState<LLMCurrentModel | null>(
    null
  );

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
        console.error("Error fetching model details:", error);
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
        console.error(error);
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

  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
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
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm custom-font-size font-medium text-white bg-indigo-600 hover:bg-indigo-700 bg-gradient-to-l from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--textColor] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Select"}
        </button>
      </form>
      {currentModel && currentModel.id && currentModel.params && (
          <CurrentModelDetails
            provider={currentModel.id.provider}
            name={currentModel.id.name}
            params={currentModel.params}
          />
        )}
      {successMessage && (
        <div className="mt-4 text-green-500 text-center">{successMessage}</div>
      )}
      <div className="mt-4 custom-font-size text-gray-500 text-center">
        Press Ctrl + . to close the model selection
      </div>
    </div>
  );
}
