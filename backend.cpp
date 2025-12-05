#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0600
#endif

#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <winsock2.h>
#include <ws2tcpip.h>

// Link with Ws2_32.lib
#pragma comment(lib, "ws2_32.lib")

const int PORT = 8080;
const int BUFFER_SIZE = 4096;

// Helper to determine content type based on file extension
std::string get_content_type(const std::string& path) {
    if (path.find(".html") != std::string::npos) return "text/html";
    if (path.find(".css") != std::string::npos) return "text/css";
    if (path.find(".js") != std::string::npos) return "application/javascript";
    if (path.find(".png") != std::string::npos) return "image/png";
    if (path.find(".jpg") != std::string::npos) return "image/jpeg";
    if (path.find(".ico") != std::string::npos) return "image/x-icon";
    return "text/plain";
}

// Helper to read file content
std::string read_file(const std::string& path) {
    // Remove leading slash to get relative path
    std::string filename = path.substr(1);
    // Open file in binary mode
    std::ifstream file(filename, std::ios::binary);
    if (!file) return "";
    std::ostringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

int main() {
    WSADATA wsaData;
    int iResult;

    // Initialize Winsock
    iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (iResult != 0) {
        std::cerr << "WSAStartup failed: " << iResult << std::endl;
        return 1;
    }

    struct addrinfo *result = NULL, *ptr = NULL, hints;

    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    hints.ai_flags = AI_PASSIVE;

    // Resolve the local address and port to be used by the server
    iResult = getaddrinfo(NULL, std::to_string(PORT).c_str(), &hints, &result);
    if (iResult != 0) {
        std::cerr << "getaddrinfo failed: " << iResult << std::endl;
        WSACleanup();
        return 1;
    }

    SOCKET ListenSocket = INVALID_SOCKET;
    ListenSocket = socket(result->ai_family, result->ai_socktype, result->ai_protocol);
    if (ListenSocket == INVALID_SOCKET) {
        std::cerr << "Error at socket(): " << WSAGetLastError() << std::endl;
        freeaddrinfo(result);
        WSACleanup();
        return 1;
    }

    // Bind the socket
    iResult = bind(ListenSocket, result->ai_addr, (int)result->ai_addrlen);
    if (iResult == SOCKET_ERROR) {
        std::cerr << "bind failed: " << WSAGetLastError() << std::endl;
        freeaddrinfo(result);
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    freeaddrinfo(result);

    // Listen for connections
    if (listen(ListenSocket, SOMAXCONN) == SOCKET_ERROR) {
        std::cerr << "Listen failed: " << WSAGetLastError() << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "C++ Backend Server listening on http://localhost:" << PORT << std::endl;

    SOCKET ClientSocket = INVALID_SOCKET;

    while (true) {
        ClientSocket = accept(ListenSocket, NULL, NULL);
        if (ClientSocket == INVALID_SOCKET) {
            std::cerr << "accept failed: " << WSAGetLastError() << std::endl;
            closesocket(ListenSocket);
            WSACleanup();
            return 1;
        }

        char recvbuf[BUFFER_SIZE];
        int recvbuflen = BUFFER_SIZE;
        std::string requestData;

        // Read request
        do {
            iResult = recv(ClientSocket, recvbuf, recvbuflen, 0);
            if (iResult > 0) {
                requestData.append(recvbuf, iResult);
                // Simple check for end of headers
                if (requestData.find("\r\n\r\n") != std::string::npos) {
                    // If we have headers, check if we need to read a body (Content-Length)
                    size_t bodyPos = requestData.find("\r\n\r\n") + 4;
                    size_t contentLengthPos = requestData.find("Content-Length: ");
                    if (contentLengthPos != std::string::npos) {
                        size_t endOfLine = requestData.find("\r\n", contentLengthPos);
                        std::string lenStr = requestData.substr(contentLengthPos + 16, endOfLine - (contentLengthPos + 16));
                        int contentLength = std::stoi(lenStr);
                        if (requestData.length() - bodyPos < contentLength) {
                            continue; // Need more data
                        }
                    }
                    break; // We have the full request (or at least headers + body if small)
                }
            } else if (iResult == 0) {
                break;
            } else {
                break;
            }
        } while (iResult > 0);

        if (!requestData.empty()) {
            std::istringstream iss(requestData);
            std::string method, path, protocol;
            iss >> method >> path >> protocol;

            std::cout << method << " " << path << std::endl;

            if (path == "/") path = "/index.html";

            // API: Get Tasks
            if (method == "GET" && path == "/api/tasks") {
                std::string content = read_file("/tasks.json");
                if (content.empty()) content = "[]"; // Default to empty array
                
                std::string response = "HTTP/1.1 200 OK\r\n"
                                       "Content-Type: application/json\r\n"
                                       "Access-Control-Allow-Origin: *\r\n"
                                       "Content-Length: " + std::to_string(content.length()) + "\r\n"
                                       "\r\n" + content;
                send(ClientSocket, response.c_str(), response.length(), 0);
            }
            // API: Save Tasks
            else if (method == "POST" && path == "/api/tasks") {
                // Extract body
                size_t bodyPos = requestData.find("\r\n\r\n");
                if (bodyPos != std::string::npos) {
                    std::string body = requestData.substr(bodyPos + 4);
                    
                    // Save to file
                    std::ofstream outfile("tasks.json", std::ios::binary);
                    outfile << body;
                    outfile.close();

                    std::string responseBody = "{\"status\": \"saved\"}";
                    std::string response = "HTTP/1.1 200 OK\r\n"
                                           "Content-Type: application/json\r\n"
                                           "Access-Control-Allow-Origin: *\r\n"
                                           "Content-Length: " + std::to_string(responseBody.length()) + "\r\n"
                                           "\r\n" + responseBody;
                    send(ClientSocket, response.c_str(), response.length(), 0);
                }
            }
            // API: Status
            else if (path == "/api/status") {
                std::string body = "{\"status\": \"running\", \"backend\": \"C++\"}";
                std::string response = "HTTP/1.1 200 OK\r\n"
                                       "Content-Type: application/json\r\n"
                                       "Access-Control-Allow-Origin: *\r\n"
                                       "Content-Length: " + std::to_string(body.length()) + "\r\n"
                                       "\r\n" + body;
                send(ClientSocket, response.c_str(), response.length(), 0);
            }
            // Static Files
            else {
                std::string content = read_file(path);
                if (content.empty()) {
                    std::string body = "404 Not Found";
                    std::string response = "HTTP/1.1 404 Not Found\r\n"
                                           "Content-Type: text/plain\r\n"
                                           "Content-Length: " + std::to_string(body.length()) + "\r\n"
                                           "\r\n" + body;
                    send(ClientSocket, response.c_str(), response.length(), 0);
                } else {
                    std::string response = "HTTP/1.1 200 OK\r\n"
                                           "Content-Type: " + get_content_type(path) + "\r\n"
                                           "Content-Length: " + std::to_string(content.length()) + "\r\n"
                                           "\r\n" + content;
                    send(ClientSocket, response.c_str(), response.length(), 0);
                }
            }
        }

        iResult = shutdown(ClientSocket, SD_SEND);
        closesocket(ClientSocket);
    }

    closesocket(ListenSocket);
    WSACleanup();
    return 0;
}
