require "uri"
require "rubygems"
require "eventmachine"
require "em-websocket"
require "yajl/http_stream"
require "pit"

account = Pit.get("twitter", :require => {
                    "username" => "username",
                    "password" => "password"
                  })

uri = URI.parse("http://%s:%s@chirpstream.twitter.com/2b/user.json" % [account["username"], account["password"]])

@channel = EM::Channel.new

EventMachine::run {
  EventMachine::defer {
    puts "server start"

    EM::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
      ws.onopen do
        sid = @channel.subscribe {|msg| ws.send msg}
        puts "#{sid} connected"

        ws.onmessage {|msg|
          puts "<#{sid}>: #{msg}"
        }

        ws.onclose {
          @channel.unsubscribe(sid)
          puts "#{sid} closed"
        }
      end
    end
  }

  EventMachine::defer {
    puts "stream start"

    Yajl::HttpStream.get(uri) do |data|
      puts data.inspect

      @channel.push Yajl::Encoder.encode(data);
    end
  }
}
