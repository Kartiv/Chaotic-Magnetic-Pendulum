function [] =  fft_function(Fs, L, vector)

%% Here, create the time signal (or define fs and T using the experimental data)
% Fs = 30;             % Sampling frequency                    
T = 1/Fs;             % Sampling period       
% L = 10;             % Length of signal
t = (0:L-1)*T;      % Time vector

%% Use fft to extract the frequencies
Frequency_Amplitudes = abs(fft(vector)); % Use fft to get the amplitudes of each frequency;...
                                         ...In fact, the amplitude of each location in the signal

Frequency_Amplitudes = Frequency_Amplitudes / (L/2);  % Divide the freq_amp in the length of the signal divided by 2

Frequency_Amplitudes = Frequency_Amplitudes(1:L/2 + 1); %Get only the relevat amplitudes

f = 0:L/2; %The length of the frequencies vector
f = f/(L/2); %Normalization of the frequencies vector
f = (Fs/2).*f; %Using the nyquist theorem to create the exact frequenct spectrum 



figure; plot(f, Frequency_Amplitudes);
xlabel('Frequency [Hz]', 'FontSize', 24);
ylabel('Weights', 'FontSize', 24);

end