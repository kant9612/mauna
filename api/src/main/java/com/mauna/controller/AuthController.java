package com.mauna.controller;

import com.mauna.domain.User;
import com.mauna.dto.LoginRequest;
import com.mauna.dto.LoginResponse;
import com.mauna.repository.UserRepository;
import com.mauna.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // TODO: 本番環境では以下のコメントを外して、認証を有効化すること
            // authenticationManager.authenticate(
            //     new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            // );

            // 一時的に認証をバイパス（開発環境専用）
            final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            final String token = jwtUtil.generateToken(userDetails);

            String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority())
                .orElse("ROLE_USER");

            // ユーザー情報からグループ情報を取得
            User user = userRepository.findByUsername(request.getUsername()).orElse(null);
            LoginResponse response = new LoginResponse(
                token,
                userDetails.getUsername(),
                role,
                user != null ? user.getEngineerId() : null,
                user != null ? user.getGroupId() : null,
                user != null ? user.getGroupName() : null
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(java.util.Map.of("error", "ユーザーが見つかりません"));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verify() {
        return ResponseEntity.ok("Token is valid");
    }
}
